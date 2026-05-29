import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import toast from 'react-hot-toast';
import BBAPlayerService from '../../../_Services/simNBA/BBAPlayerService';
import BBAGameplanService from '../../../_Services/simNBA/BBAGameplanService';
import GameplanPlayerRow from './CBBGameplanPlayerRow';
import { GetTableHoverClass } from '../../../Constants/CSSClassHelper';
import { Dropdown } from '../../_Common/Dropdown';
import { FBAToggle } from '../../_Common/SwitchToggle';
import {
    GetAdjStaminaByPace,
    GetBBAMinutesRequired,
    getProportionLimits
} from '../../../_Utility/utilHelper';
import {
    DefensiveFormationModal,
    OffensiveFormationModal,
    OffensiveStyleModal,
    PaceModal
} from './BBAGameplanModals';
import { useMediaQuery } from 'react-responsive';
import { MobileBBAGPRow } from '../../_Common/BBAMobileGPRow';

const CBBGameplan = ({ currentUser, viewMode }) => {
    return (
        <>
            <div className="container-fluid mt-3">
                <h3>
                    Interface 1.0's Gameplan Page is officially closed. Please
                    navigate to Interface 2.0 in order to use the CBB Gameplan
                    page.
                </h3>
                <a
                    href="https://calebrose.io/simsn-interface-v2/"
                    target="_blank"
                    rel="noreferrer"
                >
                    Link to SimSN Interface 2.0
                </a>
            </div>
        </>
    );

    let playerService = new BBAPlayerService();
    let gameplanService = new BBAGameplanService();
    const [team, setTeam] = useState('');
    const [roster, setRoster] = useState([]);
    const [opposingRoster, setOpposingRoster] = useState([]);
    const [gameplan, setGameplan] = useState(null);
    const [isValid, setValidation] = useState(true);
    const [pgMinutes, setPGMinutes] = useState(0);
    const [sgMinutes, setSGMinutes] = useState(0);
    const [sfMinutes, setSFMinutes] = useState(0);
    const [pfMinutes, setPFMinutes] = useState(0);
    const [cMinutes, setCMinutes] = useState(0);
    const [iProp, setIProp] = useState(0);
    const [midProp, setMidProp] = useState(0);
    const [thrProp, setThrProp] = useState(0);
    const [viewWidth, setViewWidth] = useState(window.innerWidth);
    const isMobile = useMediaQuery({ query: `(max-width:760px)` });
    const paceOptions = ['Very Fast', 'Fast', 'Balanced', 'Slow', 'Very Slow'];
    const totalAllocationLimit = 30;
    const indAllocationLimit = 15;
    const allocationMinimum = 1;
    const offFormations = [
        'Balanced',
        'Motion',
        'Pick-and-Roll',
        'Post-Up',
        'Space-and-Post'
    ];
    const defFormations = [
        'Man-to-Man',
        '1-3-1 Zone',
        '3-2 Zone',
        '2-3 Zone',
        'Box-and-One Zone'
    ];
    const styleList = ['Traditional', 'Small Ball', 'Microball', 'Jumbo'];
    const pgMinuteRequirement =
        gameplan && GetBBAMinutesRequired('PG', gameplan.OffensiveStyle, false);
    const sgMinuteRequirement =
        gameplan && GetBBAMinutesRequired('SG', gameplan.OffensiveStyle, false);
    const sfMinuteRequirement =
        gameplan && GetBBAMinutesRequired('SF', gameplan.OffensiveStyle, false);
    const pfMinuteRequirement =
        gameplan && GetBBAMinutesRequired('PF', gameplan.OffensiveStyle, false);
    const cMinuteRequirement =
        gameplan && GetBBAMinutesRequired('C', gameplan.OffensiveStyle, false);
    const tableHoverClass = GetTableHoverClass(viewMode);

    // Use Effects
    useEffect(() => {
        if (!viewWidth) {
            setViewWidth(window.innerWidth);
        }
    }, [viewWidth]);

    const handleResize = () => {
        setViewWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    useEffect(() => {
        if (currentUser) {
            setTeam(() => currentUser.cbb_team);
            getGameplan();
            getRoster();
        }
    }, [currentUser]);

    useEffect(() => {
        if (gameplan && roster) {
            checkValidation();
        }
    }, [gameplan, roster]);

    // Async Functions
    const getGameplan = async () => {
        // Get Gameplan Route using team Id
        let res = await gameplanService.GetCBBGameplan(currentUser.cbb_id);
        setGameplan(() => res.Gameplan);
        const namesList = [...res.OpposingRoster].map(
            (x) => `${x.FirstName} ${x.LastName}`
        );
        namesList.unshift('None');
        setOpposingRoster(() => [...namesList]);
    };

    const getRoster = async () => {
        let res = await playerService.GetPlayersByTeam(currentUser.cbb_id);
        const { Players } = res;
        const sortedPlayers = Players.sort((a, b) => b.Minutes - a.Minutes);
        setRoster(() => sortedPlayers);
    };

    // Handle Functions
    const updateGameplan = (name, value) => {
        let gp = { ...gameplan };
        // Keep the value in range of what's being changed

        gp[name] = value;
        setGameplan(() => gp);
    };

    const UpdateViewableColumns = (event) => {
        const { value } = event.target;
        const gp = { ...gameplan };
        gp[value] = !gp[value];
        setGameplan(() => gp);
    };

    const updatePlayer = (idx, event) => {
        let playerList = [...roster];
        let { name, value } = event.target;
        playerList[idx][name] = Number(value);
        setRoster(() => playerList);
    };

    const updatePlayerPosition = (idx, name, value) => {
        let playerList = [...roster];
        playerList[idx][name] = value;
        setRoster(() => playerList);
    };

    const IsProportionInLimits = (proportion, min, max) => {
        return proportion >= min && proportion <= max;
    };

    const setAllMinutes = (positionMinutes, ip, mp, tp) => {
        setPGMinutes(() => positionMinutes['PG']);
        setSGMinutes(() => positionMinutes['SG']);
        setSFMinutes(() => positionMinutes['SF']);
        setPFMinutes(() => positionMinutes['PF']);
        setCMinutes(() => positionMinutes['C']);
        setIProp(() => ip);
        setMidProp(() => mp);
        setThrProp(() => tp);
    };

    const updateMinutes = (pos, mins, minsObj) => {
        minsObj[pos] = (minsObj[pos] || 0) + mins;
    };

    const checkPlayerMinutes = (player, setValidation) => {
        const { FirstName, LastName, P1Minutes, P2Minutes, P3Minutes } = player;
        const totalMinutes = P1Minutes + P2Minutes + P3Minutes;
        if (P1Minutes < 0 || P2Minutes < 0 || P3Minutes < 0) {
            const message = `${FirstName} ${LastName} has allocated negative minutes. Please set the number of minutes to 0 or above.`;
            setValidation(false);
            toast.error(
                (t) => (
                    <span>
                        {message}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            return false;
        }
        if (totalMinutes > 0 && player.IsInjured) {
            const message = `${FirstName} ${LastName} has allocated minutes but is unfortunately injured. Please set the number of minutes to 0.`;
            setValidation(false);
            toast.error(
                (t) => (
                    <span>
                        {message}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            return false;
        }
        if (totalMinutes < 0) {
            const message = `${FirstName} ${LastName} has allocated negative minutes. Please set the number of minutes to 0 or above.`;
            setValidation(false);
            toast.error(
                (t) => (
                    <span>
                        {message}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            return false;
        }

        return true;
    };

    const checkRedshirtStatus = (player, setValidation) => {
        if (
            player.IsRedshirting &&
            (player.P1Minutes > 0 ||
                player.P2Minutes > 0 ||
                player.P3Minutes > 0)
        ) {
            const min = player.P1Minutes + player.P2Minutes + player.P3Minutes;
            const message = `${player.FirstName} ${player.LastName} is redshirted and is allocated ${min} minutes. Please set the number of minutes to 0.`;
            toast.error(
                (t) => (
                    <span>
                        {message}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            setValidation(false);
            return false;
        }

        if (
            player.IsRedshirting &&
            (player.InsideProportion > 0 ||
                player.MidRangeProportion > 0 ||
                player.ThreePointProportion > 0)
        ) {
            const t =
                player.InsideProportion +
                player.MidRangeProportion +
                player.ThreePointProportion;
            const message = `${player.FirstName} ${player.LastName} is redshirted and is allocated ${t} in Shot Proportion. Please set the shot proportion for Inside, Mid, and 3pt to 0.`;
            toast.error(
                (t) => (
                    <span>
                        {message}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            setValidation(false);
            return;
        }
        return true;
    };

    const checkAllocation = (name, shotType, proportion, limit) => {
        if (proportion > limit) {
            const message = `${name}'s ${shotType} Proportion is greater than 15. Please set the ${shotType} Shot proportion for this player to be between 1-15.`;
            toast.error(
                (t) => (
                    <span>
                        {message}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            setValidation(false);
            return false;
        }

        return true;
    };

    const checkValidation = () => {
        let valid = true;
        const proportionLimit = 100;
        let currentProportion = 0;
        let insideTotal = 0,
            midTotal = 0,
            threeTotal = 0;

        // Get Proportion Min & Max Limits for Inside, MidRange, and 3Pt Shooting
        const insideMin = getProportionLimits(
            gameplan.OffensiveFormation,
            'Inside',
            true
        );
        const insideMax = getProportionLimits(
            gameplan.OffensiveFormation,
            'Inside',
            false
        );
        const midMin = getProportionLimits(
            gameplan.OffensiveFormation,
            'Mid',
            true
        );
        const midMax = getProportionLimits(
            gameplan.OffensiveFormation,
            'Mid',
            false
        );
        const threeMin = getProportionLimits(
            gameplan.OffensiveFormation,
            'Three',
            true
        );
        const threeMax = getProportionLimits(
            gameplan.OffensiveFormation,
            'Three',
            false
        );

        // Get MinuteRequirements for each position based on Offensive Style Chosen
        let message = '';
        const positionMinutes = {};

        // Check Players
        for (let i = 0; i < roster.length; i++) {
            const player = roster[i];
            if (!checkPlayerMinutes(player, setValidation)) return;
            updateMinutes(
                player.PositionOne,
                player.P1Minutes,
                positionMinutes
            );
            updateMinutes(
                player.PositionTwo,
                player.P2Minutes,
                positionMinutes
            );
            updateMinutes(
                player.PositionThree,
                player.P3Minutes,
                positionMinutes
            );

            if (!checkRedshirtStatus(player, setValidation)) return;

            let playerTotalMinutes =
                player.P1Minutes + player.P2Minutes + player.P3Minutes;

            const adjStamina = GetAdjStaminaByPace(
                player.Stamina,
                gameplan.Pace
            );

            if (playerTotalMinutes > adjStamina) {
                message = `${player.FirstName} ${player.LastName}'s minutes allocation cannot exceed its Stamina: ${adjStamina}.`;
                toast.error(
                    (t) => (
                        <span>
                            {message}
                            <button onClick={() => toast.dismiss(t.id)}>
                                Dismiss
                            </button>
                        </span>
                    ),
                    { duration: 6000 }
                );
                valid = false;
                setValidation(valid);
                return;
            }
            const totalProportion =
                player.InsideProportion +
                player.MidRangeProportion +
                player.ThreePointProportion;

            if (totalProportion > playerTotalMinutes) {
                message = `${player.FirstName} ${player.LastName}'s shot allocation (${totalProportion}) cannot exceed its allocated minutes (${playerTotalMinutes}).`;
                toast.error(
                    (t) => (
                        <span>
                            {message}
                            <button onClick={() => toast.dismiss(t.id)}>
                                Dismiss
                            </button>
                        </span>
                    ),
                    { duration: 6000 }
                );
                valid = false;
                setValidation(valid);
                return;
            }

            if (playerTotalMinutes > 4) {
                if (totalProportion < allocationMinimum) {
                    message = `${player.FirstName} ${player.LastName}'s total allocation is less than or equal to 1. Because this player has minutes, please set the total shot proportion for this player to be between 1-30.`;
                    toast.error(
                        (t) => (
                            <span>
                                {message}
                                <button onClick={() => toast.dismiss(t.id)}>
                                    Dismiss
                                </button>
                            </span>
                        ),
                        { duration: 6000 }
                    );
                    valid = false;
                    setValidation(valid);
                    return;
                }
                if (totalProportion > totalAllocationLimit) {
                    message = `${player.FirstName} ${player.LastName}'s total allocation is greater than 30. Because this player has minutes, please set the total shot proportion for this player to be between 1-30.`;
                    toast.error(
                        (t) => (
                            <span>
                                {message}
                                <button onClick={() => toast.dismiss(t.id)}>
                                    Dismiss
                                </button>
                            </span>
                        ),
                        { duration: 6000 }
                    );
                    valid = false;
                    setValidation(valid);
                    return;
                }
                if (
                    !checkAllocation(
                        `${player.FirstName} ${player.LastName}`,
                        '3pt',
                        player.ThreePointProportion,
                        indAllocationLimit
                    ) ||
                    !checkAllocation(
                        `${player.FirstName} ${player.LastName}`,
                        'Mid Range',
                        player.MidRangeProportion,
                        indAllocationLimit
                    ) ||
                    !checkAllocation(
                        `${player.FirstName} ${player.LastName}`,
                        'Inside',
                        player.InsideProportion,
                        indAllocationLimit
                    )
                )
                    return;
            }
            insideTotal += player.InsideProportion;
            midTotal += player.MidRangeProportion;
            threeTotal += player.ThreePointProportion;
        }

        // Check Gameplan
        // Proportion Requirements
        if (!IsProportionInLimits(threeTotal, threeMin, threeMax)) {
            message = `Three Point Proportion for Gameplan ${gameplan.Game} set to ${threeTotal}. Please make sure this allocation is between ${threeMin} and ${threeMax}.`;
            toast.error(
                (t) => (
                    <span>
                        {message}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            valid = false;
            setValidation(valid);
            setAllMinutes(positionMinutes, insideTotal, midTotal, threeTotal);
            return;
        }

        if (!IsProportionInLimits(midTotal, midMin, midMax)) {
            message = `Mid-Range Proportion for Gameplan ${gameplan.Game} set to ${midTotal}. Please make sure this allocation is between ${midMin} and ${midMax}.`;
            toast.error(
                (t) => (
                    <span>
                        {message}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            valid = false;
            setValidation(valid);
            setAllMinutes(positionMinutes, insideTotal, midTotal, threeTotal);
            return;
        }

        if (!IsProportionInLimits(insideTotal, insideMin, insideMax)) {
            message = `Inside Proportion for Gameplan ${gameplan.Game} set to ${insideTotal}. Please make sure this allocation is between ${insideMin} and ${insideMax}.`;
            toast.error(
                (t) => (
                    <span>
                        {message}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            valid = false;
            setValidation(valid);
            setAllMinutes(positionMinutes, insideTotal, midTotal, threeTotal);
            return;
        }

        // Check the current allocated proportion and ensure it's within the formation limits
        currentProportion = threeTotal + midTotal + insideTotal;
        if (
            currentProportion > proportionLimit ||
            currentProportion < proportionLimit
        ) {
            message = `Total Proportion for Gameplan ${gameplan.Game} set to ${currentProportion}. Please make sure your allocation adds up to 100.`;
            toast.error(
                (t) => (
                    <span>
                        {message}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            valid = false;
            setValidation(valid);
            return;
        }

        // Check Total Minute Requirement based on offensive style
        if (
            positionMinutes['PG'] > pgMinuteRequirement ||
            positionMinutes['PG'] < pgMinuteRequirement
        ) {
            message = `Total Minutes between all Point Guards adds up to ${positionMinutes['PG']}.\nPlease make overall total to ${pgMinuteRequirement}.`;
            toast.error(
                (t) => (
                    <span>
                        {message}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            valid = false;
            setValidation(valid);
            setAllMinutes(positionMinutes, insideTotal, midTotal, threeTotal);
            return;
        }

        if (
            positionMinutes['SG'] > sgMinuteRequirement ||
            positionMinutes['SG'] < sgMinuteRequirement
        ) {
            message = `Total Minutes between all Shooting Guards adds up to ${positionMinutes['SG']}.\nPlease make overall total to ${sgMinuteRequirement}.`;
            toast.error(
                (t) => (
                    <span>
                        {message}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            valid = false;
            setValidation(valid);
            setAllMinutes(positionMinutes, insideTotal, midTotal, threeTotal);
            return;
        }

        if (
            positionMinutes['SF'] > sfMinuteRequirement ||
            positionMinutes['SF'] < sfMinuteRequirement
        ) {
            message = `Total Minutes between all Small Forwards adds up to ${positionMinutes['SF']}.\nPlease make overall total to ${sfMinuteRequirement}.`;
            toast.error(
                (t) => (
                    <span>
                        {message}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            valid = false;
            setValidation(valid);
            setAllMinutes(positionMinutes, insideTotal, midTotal, threeTotal);
            return;
        }

        if (
            positionMinutes['PF'] > pfMinuteRequirement ||
            positionMinutes['PF'] < pfMinuteRequirement
        ) {
            message = `Total Minutes between all Power Forwards adds up to ${positionMinutes['PF']}.\nPlease make overall total to ${pfMinuteRequirement}.`;
            toast.error(
                (t) => (
                    <span>
                        {message}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            valid = false;
            setValidation(valid);
            setAllMinutes(positionMinutes, insideTotal, midTotal, threeTotal);
            return;
        }

        if (
            positionMinutes['C'] > cMinuteRequirement ||
            positionMinutes['C'] < cMinuteRequirement
        ) {
            message = `Total Minutes between all Centers adds up to ${positionMinutes['C']}.\nPlease make overall total to ${cMinuteRequirement}.`;
            toast.error(
                (t) => (
                    <span>
                        {message}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            valid = false;
            setValidation(valid);
            setAllMinutes(positionMinutes, insideTotal, midTotal, threeTotal);
            return;
        }
        setAllMinutes(positionMinutes, insideTotal, midTotal, threeTotal);
        // Set the validation
        setValidation(valid);
        toast.success('Ready to save!', { duration: 3000 });
    };

    const SaveToast = () => {
        toast.promise(saveGameplanOptions(), {
            loading: 'Saving...',
            success: 'Successfully update Gameplan and Minutes!',
            error: 'Error! Could not save gameplan. Please reach out to admins.'
        });
    };

    const saveGameplanOptions = async () => {
        checkValidation();
        if (!isValid) return;
        const gameplanOptionsDto = {
            CollegePlayers: roster,
            Gameplan: gameplan,
            teamId: currentUser.cbb_id
        };

        const save = await gameplanService.SaveGameplanOptions(
            gameplanOptionsDto,
            'cbb'
        );

        if (save.ok) {
        } else {
            alert('HTTP-Error:', save.status);
        }
    };

    return (
        <div className="container-fluid mt-3">
            <div className="row ps-2">
                <div className="row mb-1">
                    <div className="col-md-auto justify-content-start">
                        <h2>{team} Gameplan</h2>
                    </div>
                    <div className="col-md-auto ms-auto">
                        <div className="row">
                            {gameplan && (
                                <div className="col-md-auto me-1">
                                    <h6>
                                        Pace{' '}
                                        <button
                                            type="button"
                                            className="btn btn-sm"
                                            data-bs-toggle="modal"
                                            data-bs-target="#paceModal"
                                        >
                                            <i className="bi bi-info-circle" />
                                        </button>
                                    </h6>
                                    <Dropdown
                                        value={gameplan.Pace}
                                        click={updateGameplan}
                                        name="Pace"
                                        list={paceOptions}
                                    />
                                </div>
                            )}
                            {gameplan && (
                                <div className="col-md-auto me-1">
                                    <h6>
                                        Offensive Formation{' '}
                                        <button
                                            type="button"
                                            className="btn btn-sm"
                                            data-bs-toggle="modal"
                                            data-bs-target="#offFormModal"
                                        >
                                            <i className="bi bi-info-circle" />
                                        </button>
                                    </h6>
                                    <Dropdown
                                        value={gameplan.OffensiveFormation}
                                        click={updateGameplan}
                                        name="OffensiveFormation"
                                        list={offFormations}
                                    />
                                </div>
                            )}
                            {gameplan && (
                                <div className="col-md-auto me-1">
                                    <h6>
                                        Defensive Formation{' '}
                                        <button
                                            type="button"
                                            className="btn btn-sm"
                                            data-bs-toggle="modal"
                                            data-bs-target="#defFormModal"
                                        >
                                            <i className="bi bi-info-circle" />
                                        </button>
                                    </h6>
                                    <Dropdown
                                        value={gameplan.DefensiveFormation}
                                        click={updateGameplan}
                                        name="DefensiveFormation"
                                        list={defFormations}
                                    />
                                </div>
                            )}
                            {gameplan && (
                                <div className="col-md-auto me-1">
                                    <h6>
                                        Offensive Style{' '}
                                        <button
                                            type="button"
                                            className="btn btn-sm"
                                            data-bs-toggle="modal"
                                            data-bs-target="#offStyleModal"
                                        >
                                            <i className="bi bi-info-circle" />
                                        </button>
                                    </h6>
                                    <Dropdown
                                        value={gameplan.OffensiveStyle}
                                        click={updateGameplan}
                                        name="OffensiveStyle"
                                        list={styleList}
                                    />
                                </div>
                            )}
                            {gameplan &&
                                (gameplan.DefensiveFormation === 'Man-to-Man' ||
                                    gameplan.DefensiveFormation ===
                                        'Box-and-One Zone') &&
                                opposingRoster.length > 0 && (
                                    <div className="col-md-auto me-1">
                                        <h6>Focus Player </h6>
                                        <Dropdown
                                            value={gameplan.FocusPlayer}
                                            click={updateGameplan}
                                            name="FocusPlayer"
                                            list={opposingRoster}
                                        />
                                    </div>
                                )}
                            <div className="col-md-auto">
                                <button
                                    className={`btn btn-primary ${
                                        isMobile ? 'mt-2' : ''
                                    }`}
                                    onClick={SaveToast}
                                    disabled={!isValid}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <PaceModal />
                <OffensiveFormationModal />
                <DefensiveFormationModal />
                <OffensiveStyleModal isNBA={false} />
                {gameplan && (
                    <div className="row justify-content-center mt-1 mb-1">
                        {gameplan.OffensiveStyle !== 'Jumbo' && (
                            <div className="col mx-1">
                                <h6>
                                    PG Minutes: {pgMinutes}/
                                    {pgMinuteRequirement}
                                </h6>
                            </div>
                        )}
                        <div className="col mx-1">
                            <h6>
                                SG Minutes: {sgMinutes}/{sgMinuteRequirement}
                            </h6>
                        </div>
                        <div className="col mx-1">
                            <h6>
                                SF Minutes: {sfMinutes}/{sfMinuteRequirement}
                            </h6>
                        </div>
                        {gameplan.OffensiveStyle !== 'Microball' && (
                            <div className="col mx-1">
                                <h6>
                                    PF Minutes: {pfMinutes}/
                                    {pfMinuteRequirement}
                                </h6>
                            </div>
                        )}
                        {gameplan.OffensiveStyle !== 'Microball' &&
                            gameplan.OffensiveStyle !== 'Small Ball' && (
                                <div className="col mx-1">
                                    <h6>
                                        C Minutes: {cMinutes}/
                                        {cMinuteRequirement}
                                    </h6>
                                </div>
                            )}
                        <div className="col mx-1">
                            <h6>Inside Prop.: {iProp}</h6>
                        </div>
                        <div className="col mx-1">
                            <h6>Mid Range Prop.: {midProp}</h6>
                        </div>
                        <div className="col mx-1">
                            <h6>3pt Prop.: {thrProp}</h6>
                        </div>
                    </div>
                )}
                <div className="row mt-2">
                    {gameplan && (
                        <>
                            <div className="col ps-3 me-2">
                                <FBAToggle
                                    value="ToggleFN"
                                    label="Inside Shot"
                                    checkValue={gameplan.ToggleFN}
                                    change={UpdateViewableColumns}
                                />
                            </div>
                            <div className="col ps-3 me-2">
                                <FBAToggle
                                    value="Toggle2pt"
                                    label="Mid Range Shooting"
                                    checkValue={gameplan.Toggle2pt}
                                    change={UpdateViewableColumns}
                                />
                            </div>
                            <div className="col ps-3 me-2">
                                <FBAToggle
                                    value="Toggle3pt"
                                    label="3pt Shooting"
                                    checkValue={gameplan.Toggle3pt}
                                    change={UpdateViewableColumns}
                                />
                            </div>
                            <div className="col ps-3 me-2">
                                <FBAToggle
                                    value="ToggleFT"
                                    label="Free Throws"
                                    checkValue={gameplan.ToggleFT}
                                    change={UpdateViewableColumns}
                                />
                            </div>
                            <div className="col ps-3 me-2">
                                <FBAToggle
                                    value="ToggleBW"
                                    label="Ballwork"
                                    checkValue={gameplan.ToggleBW}
                                    change={UpdateViewableColumns}
                                />
                            </div>
                            <div className="col ps-3 me-2">
                                <FBAToggle
                                    value="ToggleRB"
                                    label="Rebounding"
                                    checkValue={gameplan.ToggleRB}
                                    change={UpdateViewableColumns}
                                />
                            </div>
                            <div className="col ps-3 me-2">
                                <FBAToggle
                                    value="ToggleID"
                                    label="Int. Defense"
                                    checkValue={gameplan.ToggleID}
                                    change={UpdateViewableColumns}
                                />
                            </div>
                            <div className="col ps-3 me-2">
                                <FBAToggle
                                    value="TogglePD"
                                    label="Per. Defense"
                                    checkValue={gameplan.TogglePD}
                                    change={UpdateViewableColumns}
                                />
                            </div>
                            <div className="col ps-3 me-2">
                                <FBAToggle
                                    value="ToggleP2"
                                    label="Position Two"
                                    checkValue={gameplan.ToggleP2}
                                    change={UpdateViewableColumns}
                                />
                            </div>
                            <div className="col ps-3 me-2">
                                <FBAToggle
                                    value="ToggleP3"
                                    label="Position Three"
                                    checkValue={gameplan.ToggleP3}
                                    change={UpdateViewableColumns}
                                />
                            </div>
                        </>
                    )}
                </div>
                {!isMobile && gameplan && (
                    <div className="row">
                        <div
                            className={`row mt-3 mb-2 overflow-auto gameplan-table-height${
                                viewMode === 'dark' ? '-dark' : ''
                            }`}
                        >
                            <table className={tableHoverClass}>
                                <thead>
                                    <tr>
                                        <th
                                            scope="col"
                                            style={{ width: '250px' }}
                                        >
                                            Name
                                        </th>
                                        <th
                                            scope="col"
                                            style={{ width: '90px' }}
                                        >
                                            Overall
                                        </th>
                                        {gameplan.ToggleFN && (
                                            <th scope="col">Inside</th>
                                        )}
                                        {gameplan.Toggle2pt && (
                                            <th scope="col">Mid</th>
                                        )}
                                        {gameplan.Toggle3pt && (
                                            <th scope="col">3pt</th>
                                        )}
                                        {gameplan.ToggleFT && (
                                            <th scope="col">Free Throw</th>
                                        )}
                                        {gameplan.ToggleBW && (
                                            <th scope="col">Ballwork</th>
                                        )}
                                        {gameplan.ToggleRB && (
                                            <th scope="col">Rebounding</th>
                                        )}
                                        {gameplan.ToggleID && (
                                            <th scope="col">Int. D</th>
                                        )}
                                        {gameplan.TogglePD && (
                                            <th scope="col">Per. D</th>
                                        )}
                                        <th scope="col">
                                            <abbr title="Inside Proportion">
                                                Inside Prop.
                                            </abbr>
                                        </th>
                                        <th scope="col">
                                            <abbr title="Mid Range Proportion">
                                                Mid Prop.
                                            </abbr>
                                        </th>
                                        <th scope="col">
                                            <abbr title="3pt Proportion">
                                                3pt Prop.
                                            </abbr>
                                        </th>
                                        <th scope="col">Pos 1</th>
                                        <th scope="col">P1 Min</th>
                                        {gameplan.ToggleP2 && (
                                            <th scope="col">Pos 2</th>
                                        )}
                                        {gameplan.ToggleP2 && (
                                            <th scope="col">P2 Min</th>
                                        )}
                                        {gameplan.ToggleP3 && (
                                            <th scope="col">Pos 3</th>
                                        )}
                                        {gameplan.ToggleP3 && (
                                            <th scope="col">P3 Min</th>
                                        )}
                                        <th scope="col">Minutes</th>
                                        <th scope="col">Stamina</th>
                                        <th scope="col">
                                            Playtime Expectations
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roster &&
                                        roster.length > 0 &&
                                        roster.map((x, idx) => {
                                            return (
                                                <GameplanPlayerRow
                                                    key={x.ID}
                                                    idx={idx}
                                                    player={x}
                                                    pace={gameplan.Pace}
                                                    updatePlayer={updatePlayer}
                                                    updatePosition={
                                                        updatePlayerPosition
                                                    }
                                                    gameplan={gameplan}
                                                />
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {isMobile && gameplan && (
                    <div className="row">
                        {roster.map((x, idx) => {
                            return (
                                <MobileBBAGPRow
                                    key={x.ID}
                                    idx={idx}
                                    player={x}
                                    updatePlayer={updatePlayer}
                                    updatePosition={updatePlayerPosition}
                                    gameplan={gameplan}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const mapStateToProps = ({
    user: { currentUser },
    viewMode: { viewMode }
}) => ({
    currentUser,
    viewMode
});

export default connect(mapStateToProps)(CBBGameplan);
