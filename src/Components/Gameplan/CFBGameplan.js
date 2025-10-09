import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import toast from 'react-hot-toast';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';
import FBAGameplanService from '../../_Services/simFBA/FBAGameplanService';
import FBATeamService from '../../_Services/simFBA/FBATeamService';
import {
    FormationMap,
    BlitzAggressivenessOptions,
    CoverageOptions,
    DefensiveSchemeOptions,
    OffensiveSchemeOptions,
    PassPlayLabels,
    RunPlayLabels,
    TargetingLabels,
    OptionPlayLabels,
    RPOLabels,
    schemeDropdownClass,
    FocusPlayList
} from './GameplanConstants';
import {
    GameplanInputItem,
    GameplanInputSm,
    RunInput,
    TargetInput
} from './GameplanInputItem';
import {
    GetDefensivePositions,
    ValidatePassPlayDistribution,
    ValidateRunPlayDistribution
} from './GameplanHelper';
import { DropdownItemObj } from '../Roster/DropdownItem';
import { DropdownItem } from '../_Common/Dropdown';
import { SchemeInfo } from './SchemeInfo';
import { FBAToggle } from '../_Common/SwitchToggle';
import {
    DefaultSchemes,
    DefenseDefaultSchemes
} from '../../Constants/DefaultSchemes';
import {
    DefensiveSchemeModal,
    DistributionsModal,
    FormationModal,
    GPTab,
    OpposingSchemeRow,
    SchemeDropdown,
    SchemeModal,
    ViewFormationModal
} from './GameplanCommons';
import routes from '../../Constants/routes';
import { InputRange } from '../_Common/InputRange';
import Select from 'react-select';
import { MapOptions } from '../../_Utility/filterHelper';
import { getKeyByValue } from '../../_Utility/utilHelper';

const CFBGameplan = ({ currentUser, cfbTeam, nflTeam, isNFL }) => {
    // GameplanService
    let gameplanService = new FBAGameplanService();
    let _teamService = new FBATeamService();
    const [userTeam, setUserTeam] = useState('');
    const [team, setTeam] = useState('');
    const [aiTeams, setAITeams] = useState(null);
    const [teamColors, setTeamColors] = useState({});
    const [initialGameplan, setInitialGameplan] = useState(null);
    const [gameplan, setGameplan] = useState(null);
    const [opponentScheme, setOpponentScheme] = useState(null);
    const [depthChart, setDepthChart] = useState(null);
    const [activeView, setActiveView] = useState('Offensive Formations');
    const [selectedFormation, setSelectedFormation] = useState('');
    const [passTotal, setPassTotal] = useState(0);
    const [diveFocus, setDiveFocus] = useState(50);
    const [pitchFocus, setPitchFocus] = useState(50);
    const [tradRunTotal, setTradRunTotal] = useState(0);
    const [optRunTotal, setOptRunTotal] = useState(0);
    const [rpoTotal, setRPOTotal] = useState(0);
    const [opponentTargets, setOpponentTargets] = useState([]);
    const [opponentMap, setOpponentMap] = useState({});
    const [selectedFocusPlays, setSelectedFocusPlays] = useState([]);
    const [isValid, setValidation] = useState(false);
    const [viewWidth, setViewWidth] = useState(window.innerWidth);
    const isMobile = useMediaQuery({ query: `(max-width:760px)` });
    const focusPlayOptions = MapOptions(FocusPlayList);
    const offensiveFormations = useMemo(() => {
        if (gameplan && gameplan.OffensiveScheme.length > 0) {
            const forms = FormationMap[gameplan.OffensiveScheme].Formations;
            return forms.length > 0 ? forms : [];
        }
        return [];
    }, [gameplan]);

    const isDefaultOffense = gameplan && gameplan.DefaultOffense;
    const isDefaultDefense = gameplan && gameplan.DefaultDefense;
    const defensiveFormations =
        gameplan && gameplan.DefensiveScheme
            ? FormationMap[gameplan.DefensiveScheme].Formations
            : [];

    const opposingFormation =
        opponentScheme && opponentScheme !== 'None' && opponentScheme
            ? FormationMap[opponentScheme].Formations
            : [];
    // UseEffects
    useEffect(() => {
        if (!viewWidth) {
            setViewWidth(window.innerWidth);
        }
    }, [viewWidth]);

    const handleResize = () => {
        setViewWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // On init
    useEffect(() => {
        if (currentUser) {
            // GetGameplan(currentUser.teamId);
            setUserTeam(!isNFL ? cfbTeam : nflTeam);
            GetAvailableTeams();
        }
    }, [currentUser]);

    useEffect(() => {
        if (cfbTeam && !isNFL) {
            setTeam(cfbTeam);
            const colors = {
                color: '#fff',
                backgroundColor:
                    cfbTeam && cfbTeam.ColorOne ? cfbTeam.ColorOne : '#6c757d',
                borderColor:
                    cfbTeam && cfbTeam.ColorOne ? cfbTeam.ColorOne : '#6c757d'
            };
            setTeamColors(colors);
        }
        if (nflTeam && isNFL) {
            setTeam(nflTeam);
            const colors = {
                color: '#fff',
                backgroundColor:
                    nflTeam && nflTeam.ColorOne ? nflTeam.ColorOne : '#6c757d',
                borderColor:
                    nflTeam && nflTeam.ColorOne ? nflTeam.ColorOne : '#6c757d'
            };
            setTeamColors(colors);
        }
    }, [cfbTeam, nflTeam, isNFL]);

    useEffect(() => {
        if (team) {
            GetGameplan(team.ID);
        }
    }, [team]);

    const ValidatePlayDistribution = (dist, total, playType, setValidation) => {
        if (dist !== total) {
            const message = `Total ${playType} Distribution is set to ${dist}. Please navigate to the Offense Distribution Tab make sure your allocation equals 100.`;
            setValidation(false);
            toast.error(
                (t) => (
                    <span>
                        {message}{' '}
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

    const ValidateDefense = (formation, label, setValidation) => {
        if (formation.length === 0) {
            const message = `Defensive ${label} was not selected. Please make to select a defensive formation to face against the opponent's ${label}.`;
            setValidation(false);
            toast.error(
                (t) => (
                    <span>
                        {message}{' '}
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

    const CheckWeightDistribution = (weight, playType, setValidation) => {
        if (weight < 0 || weight > 10) {
            const message = `The ${playType} Weight Distribution is set to ${weight}. Please make sure the number is between 0 and 10.`;
            setValidation(false);
            toast.error(
                (t) => (
                    <span>
                        {message}{' '}
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

    const CheckPlayTypeDistribution = (
        weight,
        min,
        max,
        playType,
        setValidation
    ) => {
        if (weight < min || weight > max) {
            const message = `The ${playType} Weight Distribution is set to ${weight}. Please make sure the number is between ${min} and ${max}.`;
            setValidation(false);
            toast.error(
                (t) => (
                    <span>
                        {message}{' '}
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

    const CheckForDistributionInUnusedWeight = (
        formation,
        weight,
        trad,
        opt,
        rpo,
        pass,
        setValidation
    ) => {
        if (weight === 0 && (trad > 0 || opt > 0 || rpo > 0 || pass > 0)) {
            const message = `Offensive Formation ${formation} has weights set greater than zero despite Formation Weight set to 0. Please set all play type weights for formation ${formation} to zero.`;
            setValidation(() => false);
            toast.error(
                (t) => (
                    <span>
                        {message}{' '}
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

    const CheckForDistributionWeight = (formation, weight, setValidation) => {
        if (weight > 50) {
            const message = `Offensive Formation ${formation} has a weight set greater than 50. Please reduce the number to 50 or less.`;
            setValidation(() => false);
            toast.error(
                (t) => (
                    <span>
                        {message}{' '}
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

    // Function Handlers
    const CheckValidation = (gamePlanObj) => {
        const gp = { ...gamePlanObj };
        const offensiveScheme = FormationMap[gp.OffensiveScheme];
        const defensiveScheme = FormationMap[gp.DefensiveScheme];
        const { Ranges } = offensiveScheme;
        const totalDistribution = 100;
        let formationDist = 0;
        let tradRunDist = 0;
        let optRunDist = 0;
        let rpoDist = 0;
        let passDist = 0;
        let currentDistribution = 0;
        let message = '';
        let formationCount = 0;
        let enoughWeight = true;
        // Check Offensive formations

        let offForm1Weight =
            gp.OffForm1TraditionalRun +
            gp.OffForm1OptionRun +
            gp.OffForm1RPO +
            gp.OffForm1Pass;
        let offForm2Weight =
            gp.OffForm2TraditionalRun +
            gp.OffForm2OptionRun +
            gp.OffForm2RPO +
            gp.OffForm2Pass;
        let offForm3Weight =
            gp.OffForm3TraditionalRun +
            gp.OffForm3OptionRun +
            gp.OffForm3RPO +
            gp.OffForm3Pass;
        let offForm4Weight =
            gp.OffForm4TraditionalRun +
            gp.OffForm4OptionRun +
            gp.OffForm4RPO +
            gp.OffForm4Pass;
        let offForm5Weight =
            gp.OffForm5TraditionalRun +
            gp.OffForm5OptionRun +
            gp.OffForm5RPO +
            gp.OffForm5Pass;

        gp.OffForm1Weight = offForm1Weight;
        gp.OffForm2Weight = offForm2Weight;
        gp.OffForm3Weight = offForm3Weight;
        gp.OffForm4Weight = offForm4Weight;
        gp.OffForm5Weight = offForm5Weight;

        setGameplan(() => gp);

        if (offForm1Weight > 0) {
            formationCount += 1;
            enoughWeight = CheckForDistributionWeight(
                'One',
                offForm1Weight,
                setValidation
            );
        }

        if (!enoughWeight) return;

        if (offForm2Weight > 0) {
            formationCount += 1;
            enoughWeight = CheckForDistributionWeight(
                'Two',
                offForm2Weight,
                setValidation
            );
        }
        if (!enoughWeight) return;

        if (offForm3Weight > 0) {
            formationCount += 1;
            enoughWeight = CheckForDistributionWeight(
                'Three',
                offForm3Weight,
                setValidation
            );
        }
        if (!enoughWeight) return;

        if (offForm4Weight > 0) {
            formationCount += 1;
            enoughWeight = CheckForDistributionWeight(
                'Four',
                offForm4Weight,
                setValidation
            );
        }
        if (!enoughWeight) return;

        if (offForm5Weight > 0) {
            formationCount += 1;
            enoughWeight = CheckForDistributionWeight(
                'Five',
                offForm5Weight,
                setValidation
            );
        }
        if (!enoughWeight) return;

        if (formationCount <= 1) {
            message = `You're currently weighted to use ${formationCount} different formations when the minimum is 2. Please increase the weight of one of your unused formations to bring the count between 2 and 3.`;
            setValidation(() => false);
            toast.error(
                (t) => (
                    <span>
                        {message}{' '}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            return;
        }

        formationDist =
            offForm1Weight +
            offForm2Weight +
            offForm3Weight +
            offForm4Weight +
            offForm5Weight;

        if (formationDist !== totalDistribution) {
            message = `Total Offensive Formation Ratio is set to ${formationDist}. Please make sure your allocation equals 100.`;
            setValidation(() => false);
            toast.error(
                (t) => (
                    <span>
                        {message}{' '}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            return;
        }

        const unusedWeightForm1 = CheckForDistributionInUnusedWeight(
            'One',
            offForm1Weight,
            gp.OffForm1TraditionalRun,
            gp.OffForm1OptionRun,
            gp.OffForm1RPO,
            gp.OffForm1Pass,
            setValidation
        );
        const unusedWeightForm2 = CheckForDistributionInUnusedWeight(
            'Two',
            offForm2Weight,
            gp.OffForm2TraditionalRun,
            gp.OffForm2OptionRun,
            gp.OffForm2RPO,
            gp.OffForm2Pass,
            setValidation
        );
        const unusedWeightForm3 = CheckForDistributionInUnusedWeight(
            'Three',
            offForm3Weight,
            gp.OffForm3TraditionalRun,
            gp.OffForm3OptionRun,
            gp.OffForm3RPO,
            gp.OffForm3Pass,
            setValidation
        );
        const unusedWeightForm4 = CheckForDistributionInUnusedWeight(
            'Four',
            offForm4Weight,
            gp.OffForm4TraditionalRun,
            gp.OffForm4OptionRun,
            gp.OffForm4RPO,
            gp.OffForm4Pass,
            setValidation
        );
        const unusedWeightForm5 = CheckForDistributionInUnusedWeight(
            'Five',
            offForm5Weight,
            gp.OffForm5TraditionalRun,
            gp.OffForm5OptionRun,
            gp.OffForm5RPO,
            gp.OffForm5Pass,
            setValidation
        );

        if (
            !unusedWeightForm1 ||
            !unusedWeightForm2 ||
            !unusedWeightForm3 ||
            !unusedWeightForm4 ||
            !unusedWeightForm5
        )
            return;

        // Get Min,Max Ranges
        const { TraditionalRun, OptionRun, RPO, Pass } = Ranges;

        // Check Ratio Min & Max
        tradRunDist =
            gp.OffForm1TraditionalRun +
            gp.OffForm2TraditionalRun +
            gp.OffForm3TraditionalRun +
            gp.OffForm4TraditionalRun +
            gp.OffForm5TraditionalRun;

        const checkTradRun = CheckPlayTypeDistribution(
            tradRunDist,
            TraditionalRun.Min,
            TraditionalRun.Max,
            'Traditional Run',
            setValidation
        );

        if (
            gp.OffensiveScheme === 'Air Raid' &&
            gp.OffForm3TraditionalRun > 0
        ) {
            message = `The Empty Gun formation does not have a runningback and thus cannot support traditional run plays. Please set this value to 0.`;
            setValidation(() => false);
            toast.error(
                (t) => (
                    <span>
                        {message}{' '}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            return;
        }

        optRunDist =
            gp.OffForm1OptionRun +
            gp.OffForm2OptionRun +
            gp.OffForm3OptionRun +
            gp.OffForm4OptionRun +
            gp.OffForm5OptionRun;
        const checkOptRun = CheckPlayTypeDistribution(
            optRunDist,
            OptionRun.Min,
            OptionRun.Max,
            'Option Run',
            setValidation
        );
        rpoDist =
            gp.OffForm1RPO +
            gp.OffForm2RPO +
            gp.OffForm3RPO +
            gp.OffForm4RPO +
            gp.OffForm5RPO;
        const checkRPO = CheckPlayTypeDistribution(
            rpoDist,
            RPO.Min,
            RPO.Max,
            'RPO',
            setValidation
        );

        passDist =
            gp.OffForm1Pass +
            gp.OffForm2Pass +
            gp.OffForm3Pass +
            gp.OffForm4Pass +
            gp.OffForm5Pass;

        const checkPass = CheckPlayTypeDistribution(
            passDist,
            Pass.Min,
            Pass.Max,
            'Pass',
            setValidation
        );

        setPassTotal(() => passDist);
        setTradRunTotal(() => tradRunDist);
        setOptRunTotal(() => optRunDist);
        setRPOTotal(() => rpoDist);
        const playTypeSum = passDist + tradRunDist + optRunDist + rpoDist;
        if (playTypeSum !== 100) {
            message = `The sum of all Play Types across all formations is ${playTypeSum}. Please set this to 100.`;
            setValidation(() => false);
            toast.error(
                (t) => (
                    <span>
                        {message}{' '}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            return;
        }

        if (!checkTradRun || !checkOptRun || !checkRPO || !checkPass) return;
        // Check Running Distribution
        // Check Max Values on Distribution

        // Need to redo run distributions by scheme
        currentDistribution =
            gp.RunnerDistributionRB1 +
            gp.RunnerDistributionRB2 +
            gp.RunnerDistributionRB3 +
            gp.RunnerDistributionFB1 +
            gp.RunnerDistributionFB2 +
            gp.RunnerDistributionWR +
            gp.RunnerDistributionQB;

        let rb1Check = CheckWeightDistribution(
            gp.RunnerDistributionRB1,
            'Run',
            setValidation
        );
        let rb2Check = CheckWeightDistribution(
            gp.RunnerDistributionRB2,
            'Run',
            setValidation
        );
        const rb3Check = CheckWeightDistribution(
            gp.RunnerDistributionRB2,
            'Run',
            setValidation
        );
        let fb1Check = CheckWeightDistribution(
            gp.RunnerDistributionFB1,
            'Run',
            setValidation
        );
        const fb2Check = CheckWeightDistribution(
            gp.RunnerDistributionFB2,
            'Run',
            setValidation
        );
        const wrCheck = CheckWeightDistribution(
            gp.RunnerDistributionWR,
            'Run',
            setValidation
        );
        const qbCheck = CheckWeightDistribution(
            gp.RunnerDistributionQB,
            'Run',
            setValidation
        );

        if (
            !rb1Check ||
            !rb2Check ||
            !rb3Check ||
            !fb1Check ||
            !fb2Check ||
            !wrCheck ||
            !qbCheck
        ) {
            return;
        }

        const wr1Check = CheckWeightDistribution(
            gp.TargetingWR1,
            'Pass',
            setValidation
        );
        const wr2Check = CheckWeightDistribution(
            gp.TargetingWR2,
            'Pass',
            setValidation
        );

        const wr3Check = CheckWeightDistribution(
            gp.TargetingWR3,
            'Pass',
            setValidation
        );

        const wr4Check = CheckWeightDistribution(
            gp.TargetingWR4,
            'Pass',
            setValidation
        );

        const wr5Check = CheckWeightDistribution(
            gp.TargetingWR5,
            'Pass',
            setValidation
        );

        const te1Check = CheckWeightDistribution(
            gp.TargetingTE1,
            'Pass',
            setValidation
        );

        const te2Check = CheckWeightDistribution(
            gp.TargetingTE2,
            'Pass',
            setValidation
        );

        const te3Check = CheckWeightDistribution(
            gp.TargetingTE3,
            'Pass',
            setValidation
        );
        rb1Check = CheckWeightDistribution(
            gp.TargetingRB1,
            'Pass',
            setValidation
        );

        rb2Check = CheckWeightDistribution(
            gp.TargetingRB2,
            'Pass',
            setValidation
        );

        fb1Check = CheckWeightDistribution(
            gp.TargetingFB1,
            'Pass',
            setValidation
        );

        if (
            !rb1Check ||
            !rb2Check ||
            !fb1Check ||
            !wr1Check ||
            !wr2Check ||
            !wr3Check ||
            !wr4Check ||
            !wr5Check ||
            !te1Check ||
            !te2Check ||
            !te3Check
        ) {
            return;
        }

        // Check Run Play Distribution
        // Do max value checks on Run Plays
        const validRunPlays = ValidateRunPlayDistribution(gp);

        if (!validRunPlays) {
            message =
                'Run Play Distribution is out of range. Please change ranges for all inside, outside, and power plays (50 max) and all draw plays (15 max)';
            setValidation(validRunPlays);
            toast.error(
                (t) => (
                    <span>
                        {message}{' '}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 6000 }
            );
            return;
        }

        currentDistribution =
            gp.RunOutsideLeft +
            gp.RunOutsideRight +
            gp.RunInsideLeft +
            gp.RunInsideRight +
            gp.RunPowerLeft +
            gp.RunPowerRight +
            gp.RunDrawLeft +
            gp.RunDrawRight;

        const validRun = ValidatePlayDistribution(
            currentDistribution,
            totalDistribution,
            'Run Play',
            setValidation
        );

        if (!validRun) return;

        currentDistribution =
            gp.ReadOptionLeft +
            gp.ReadOptionRight +
            gp.SpeedOptionLeft +
            gp.SpeedOptionRight +
            gp.InvertedOptionLeft +
            gp.InvertedOptionRight +
            gp.TripleOptionLeft +
            gp.TripleOptionRight;

        const validOption =
            optRunDist > 0 &&
            ValidatePlayDistribution(
                currentDistribution,
                totalDistribution,
                'Option Run',
                setValidation
            );
        if (optRunDist > 0 && !validOption) return;

        // Check Pass Play Distribution
        const validPassPlays = ValidatePassPlayDistribution(gp);

        if (!validPassPlays) {
            const schemeNote =
                gp.OffensiveScheme === 'Air Raid'
                    ? 'Please note: Long Plays and PA Long Plays are totaled together with a max of 50 for Air Raid.'
                    : '';
            message = `Please modify the pass play distribution for all plays for the current scheme: ${gp.OffensiveScheme}. ${schemeNote}`;
            setValidation(validPassPlays);
            toast.error(
                (t) => (
                    <span>
                        {message}{' '}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 10000 }
            );
            return;
        }

        currentDistribution =
            gp.PassQuick +
            gp.PassShort +
            gp.PassLong +
            gp.PassDeep +
            gp.PassScreen +
            gp.PassPAMedium +
            gp.PassPALong +
            gp.PassPADeep;

        const validPass = ValidatePlayDistribution(
            currentDistribution,
            totalDistribution,
            'Pass Play',
            setValidation
        );
        if (!validPass) return;

        currentDistribution =
            gp.ChoiceOutside +
            gp.ChoiceInside +
            gp.PeekOutside +
            gp.PeekInside +
            gp.ChoicePower +
            gp.PeekPower;

        const validRPO =
            rpoDist > 0 &&
            ValidatePlayDistribution(
                currentDistribution,
                totalDistribution,
                'RPO',
                setValidation
            );
        if (rpoDist > 0 && !validRPO) return;

        const validDefense1 = ValidateDefense(
            gp.DefFormation1,
            'Formation 1',
            setValidation
        );
        if (!validDefense1) return;
        const validDefense2 = ValidateDefense(
            gp.DefFormation2,
            'Formation 2',
            setValidation
        );
        if (!validDefense2) return;
        const validDefense3 = ValidateDefense(
            gp.DefFormation3,
            'Formation 3',
            setValidation
        );
        if (!validDefense3) return;
        const validDefense4 = ValidateDefense(
            gp.DefFormation4,
            'Formation 4',
            setValidation
        );
        if (!validDefense4) return;
        const validDefense5 = ValidateDefense(
            gp.DefFormation5,
            'Formation 5',
            setValidation
        );

        if (!validDefense5) return;

        if (selectedFocusPlays.length > 3) {
            message = `ERROR: More than 3 focus plays have been selected. Please reduce to either 3 or less.`;
            setValidation(false);
            toast.error(
                (t) => (
                    <span>
                        {message}{' '}
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),
                { duration: 5000 }
            );
            return;
        }

        setValidation(() => true);
        toast.success('Gameplan is ready to save!', { duration: 3000 });
    };

    const SelectUserTeam = () => {
        SelectTeam(userTeam);
    };

    const SelectTeam = (selectedTeam) => {
        setTeam(selectedTeam);
    };

    const GetGameplan = async (ID) => {
        let response = !isNFL
            ? await gameplanService.GetGameplanByTeamID(ID)
            : await gameplanService.GetNFLGameplanByTeamID(ID);
        const {
            CollegeGP,
            CollegeDC,
            OpponentScheme,
            NFLGP,
            NFLDC,
            CollegeOppPlayers,
            NFLOppPlayers
        } = response;
        const { DepthChartPlayers } = !isNFL ? CollegeDC : NFLDC;
        const targetPositions = ['QB', 'RB', 'WR', 'TE', 'FB'];
        const positionPlayers = DepthChartPlayers.filter((x) =>
            targetPositions.includes(x.Position)
        );
        setDepthChart([...positionPlayers]);
        setOpponentScheme(() =>
            OpponentScheme !== '' ? OpponentScheme : 'Power Run'
        );
        let tradRunDist = 0;
        let optRunDist = 0;
        let rpoDist = 0;
        let passDist = 0;
        if (!isNFL) {
            const playerMap = {};
            const strPlayers = ['None'];
            const r = [...CollegeOppPlayers];
            for (let i = 0; i < r.length; i++) {
                const playerStr = `${r[i].Position} ${r[i].FirstName} ${r[i].LastName}`;
                playerMap[playerStr] = r[i].ID;
                strPlayers.push(playerStr);
            }
            const { FocusPlays } = CollegeGP;
            const fp = FocusPlays.split(',');
            setSelectedFocusPlays(() => fp);
            setOpponentMap(() => playerMap);
            setOpponentTargets(strPlayers);
            const targetName =
                CollegeGP.DoubleTeam === 0 || CollegeGP.DoubleTeam === -1
                    ? ''
                    : getKeyByValue(playerMap, CollegeGP.DoubleTeam);

            setInitialGameplan({ ...CollegeGP, DoubleTeam: targetName });
            setGameplan({ ...CollegeGP, DoubleTeam: targetName });
            setPitchFocus(() => CollegeGP.PitchFocus);
            setDiveFocus(() => CollegeGP.DiveFocus);
            tradRunDist =
                CollegeGP.OffForm1TraditionalRun +
                CollegeGP.OffForm2TraditionalRun +
                CollegeGP.OffForm3TraditionalRun +
                CollegeGP.OffForm4TraditionalRun +
                CollegeGP.OffForm5TraditionalRun;

            optRunDist =
                CollegeGP.OffForm1OptionRun +
                CollegeGP.OffForm2OptionRun +
                CollegeGP.OffForm3OptionRun +
                CollegeGP.OffForm4OptionRun +
                CollegeGP.OffForm5OptionRun;

            rpoDist =
                CollegeGP.OffForm1RPO +
                CollegeGP.OffForm2RPO +
                CollegeGP.OffForm3RPO +
                CollegeGP.OffForm4RPO +
                CollegeGP.OffForm5RPO;

            passDist =
                CollegeGP.OffForm1Pass +
                CollegeGP.OffForm2Pass +
                CollegeGP.OffForm3Pass +
                CollegeGP.OffForm4Pass +
                CollegeGP.OffForm5Pass;
            CheckValidation(CollegeGP);
        } else {
            const playerMap = {};
            const strPlayers = ['None'];
            const r = [...NFLOppPlayers];
            for (let i = 0; i < r.length; i++) {
                const playerStr = `${r[i].Position} ${r[i].FirstName} ${r[i].LastName}`;
                playerMap[playerStr] = r[i].ID;
                strPlayers.push(playerStr);
            }
            const targetName =
                NFLGP.DoubleTeam === 0 || NFLGP.DoubleTeam === -1
                    ? ''
                    : getKeyByValue(playerMap, NFLGP.DoubleTeam);
            setOpponentMap(() => playerMap);
            setOpponentTargets(strPlayers);
            const { FocusPlays } = NFLGP;
            const fp = FocusPlays.split(',');
            setSelectedFocusPlays(() => fp);
            setInitialGameplan({ ...NFLGP, DoubleTeam: targetName });
            setGameplan({ ...NFLGP, DoubleTeam: targetName });
            setPitchFocus(() => NFLGP.PitchFocus);
            setDiveFocus(() => NFLGP.DiveFocus);

            tradRunDist =
                NFLGP.OffForm1TraditionalRun +
                NFLGP.OffForm2TraditionalRun +
                NFLGP.OffForm3TraditionalRun +
                NFLGP.OffForm4TraditionalRun +
                NFLGP.OffForm5TraditionalRun;

            optRunDist =
                NFLGP.OffForm1OptionRun +
                NFLGP.OffForm2OptionRun +
                NFLGP.OffForm3OptionRun +
                NFLGP.OffForm4OptionRun +
                NFLGP.OffForm5OptionRun;

            rpoDist =
                NFLGP.OffForm1RPO +
                NFLGP.OffForm2RPO +
                NFLGP.OffForm3RPO +
                NFLGP.OffForm4RPO +
                NFLGP.OffForm5RPO;

            passDist =
                NFLGP.OffForm1Pass +
                NFLGP.OffForm2Pass +
                NFLGP.OffForm3Pass +
                NFLGP.OffForm4Pass +
                NFLGP.OffForm5Pass;

            CheckValidation(NFLGP);
        }

        setTradRunTotal(tradRunDist);
        setOptRunTotal(optRunDist);
        setRPOTotal(rpoDist);
        setPassTotal(passDist);
    };

    const GetAvailableTeams = async () => {
        let res = !isNFL
            ? await _teamService.GetAllCollegeTeams()
            : await _teamService.GetAllNFLTeams();

        setAITeams(res);
    };

    // Event Functions
    const HandleTextChange = (name, value) => {
        let gp = { ...gameplan };

        if (value === 'Yes') {
            gp[name] = true;
        } else if (value === 'No') {
            gp[name] = false;
        } else {
            gp[name] = value;
        }
        if (name === 'OffensiveScheme' && gp.DefaultOffense) {
            gp = MapDefaultOptions(gp, 'DefaultOffense');
        } else if (name === 'DefensiveScheme' && gp.DefaultDefense) {
            gp = MapDefaultOptions(gp, 'DefaultDefense');
        } else if (name === 'DoubleTeam') {
            gp[name] = value === 'None' ? 'None' : value;
        }

        setGameplan(() => gp);
    };

    const HandleToggleChange = (event) => {
        const { value } = event.target;
        let gp = { ...gameplan };
        gp[value] = !gp[value];

        if (value === 'DefaultOffense') {
            gp = MapDefaultOptions(gp, value);
        } else if (value === 'DefaultDefense') {
            gp = MapDefaultOptions(gp, value);
        }

        CheckValidation(gp);
    };

    const HandleNumberChange = (event) => {
        let gp = { ...gameplan };
        let { name, value } = event.target;

        let num = Number(value);
        if (num < 0) {
            num = 0;
        }
        if (num > 100) {
            num = 100;
        }
        gp[name] = num;

        // If Value IS NOT a Number...
        CheckValidation(gp);
    };

    const HandleRangeChange = (event) => {
        let gp = { ...gameplan };
        let { name, value } = event.target;

        let num = Number(value);
        if (num < 0) {
            num = 0;
        }

        if (name === 'PitchFocus') {
            setPitchFocus(() => num);
        } else {
            setDiveFocus(() => num);
        }
    };

    const HandleFormation = (event) => {
        event.preventDefault();
        const value = event.currentTarget.getAttribute('value');
        if (value && value.length > 0) {
            setSelectedFormation(() => value);
        }
    };

    const MapDefaultOptions = (gpObj, value) => {
        const gp = { ...gpObj };
        if (value === 'DefaultOffense' || value === 'OffensiveScheme') {
            const defaults = DefaultSchemes[gp.OffensiveScheme];
            if (!defaults) {
                console.error('Invalid scheme selected!');
                return;
            }
            for (const key in defaults) {
                gp[key] = defaults[key];
            }
            gp['PrimaryHB'] = 75;
        } else if (value === 'DefaultDefense' || value === 'DefensiveScheme') {
            const defaults = DefenseDefaultSchemes[gp.DefensiveScheme];
            const defaultsByOppScheme = defaults[opponentScheme];
            if (!defaults && !defaultsByOppScheme) {
                console.error('Invalid scheme selected!');
                return;
            }
            for (const key in defaultsByOppScheme) {
                gp[key] = defaultsByOppScheme[key];
            }
            setPitchFocus(() => 50);
            setDiveFocus(() => 50);
        }

        return gp;
    };

    const ChangeFocusPlays = (options) => {
        const opts = [...options.map((x) => x.value)];
        setSelectedFocusPlays(() => opts);
    };

    const SaveToast = () => {
        toast.promise(SaveGameplanOptions(), {
            loading: 'Saving...'
        });
    };

    const SaveGameplanOptions = async () => {
        if (!isValid) return;

        const oppMap = { ...opponentMap };
        let dtValue = gameplan.DoubleTeam;
        let id = oppMap[dtValue];
        if (
            dtValue === '' ||
            dtValue === 'None' ||
            dtValue === 0 ||
            dtValue === -1
        ) {
            id = -1;
        }

        const fp = [...selectedFocusPlays];
        const focusPlaysStr = fp.join(',');

        const fullGP = {
            ...gameplan,
            OffFormation1Name: offensiveFormations[0].name,
            OffFormation2Name: offensiveFormations[1].name,
            OffFormation3Name: offensiveFormations[2].name,
            OffFormation4Name: offensiveFormations[3].name,
            OffFormation5Name: offensiveFormations[4].name,
            PitchFocus: pitchFocus,
            DiveFocus: diveFocus,
            DoubleTeam: Number(id),
            FocusPlays: focusPlaysStr
        };

        const UpdateGameplanDTO = !isNFL
            ? {
                  GameplanID: gameplan.ID.toString(),
                  UpdatedGameplan: fullGP,
                  Username: currentUser.username,
                  TeamName: cfbTeam.TeamName
              }
            : {
                  GameplanID: gameplan.ID.toString(),
                  UpdatedNFLGameplan: fullGP,
                  Username: currentUser.username,
                  TeamName: nflTeam.TeamName
              };

        // Save
        const save = !isNFL
            ? await gameplanService.SaveGameplan(UpdateGameplanDTO)
            : await gameplanService.SaveNFLGameplan(UpdateGameplanDTO);

        if (save.ok) {
            // YAY!
            toast.success('Successfully Saved Gameplan!', {
                style: {
                    border: `1px solid ${
                        !isNFL ? cfbTeam.ColorOne : nflTeam.ColorOne
                    }`,
                    padding: '16px',
                    color: !isNFL ? cfbTeam.ColorTwo : nflTeam.ColorTwo
                },
                iconTheme: {
                    primary: !isNFL ? cfbTeam.ColorOne : nflTeam.ColorOne,
                    secondary: !isNFL ? cfbTeam.ColorTwo : nflTeam.ColorTwo
                },
                duration: 4000
            });
        } else {
            toast.error('Could not save Gameplan.');
        }

        // Response
        setInitialGameplan({ ...gameplan });
    };

    const ResetGameplan = () => {
        const originalGameplan = { ...initialGameplan };
        setGameplan(() => originalGameplan);
    };

    // Mobile classes

    // Return
    return (
        <div className="container-fluid mt-3 cfb-gameplan-container px-4">
            <div className="row mb-1">
                <div className="col-md-auto justify-content-start">
                    <h2>{team ? team.TeamName : ''} Gameplan</h2>
                </div>
                <div className="col-md-auto ms-auto d-flex align-items-center">
                    {currentUser && currentUser.roleID === 'Admin' && (
                        <div className="drop-start btn-dropdown-width-team me-2">
                            <button
                                name="team"
                                className="btn dropdown-toggle btn-dropdown-width-team"
                                id="dropdownMenuButton1"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <span>{team ? team.TeamName : ''}</span>
                            </button>
                            <ul className="dropdown-menu dropdown-content">
                                <DropdownItemObj
                                    value={
                                        currentUser
                                            ? currentUser.team +
                                              ' ' +
                                              currentUser.mascot
                                            : null
                                    }
                                    click={SelectUserTeam}
                                    id={currentUser ? currentUser.teamId : null}
                                />
                                <hr className="dropdown-divider"></hr>
                                {aiTeams && aiTeams.length > 0
                                    ? aiTeams.map((x) => (
                                          <DropdownItemObj
                                              key={x.ID}
                                              value={
                                                  x.TeamName + ' ' + x.Mascot
                                              }
                                              team={x}
                                              id={x.ID}
                                              click={SelectTeam}
                                          />
                                      ))
                                    : ''}
                            </ul>
                        </div>
                    )}
                    <Link
                        to={isNFL ? routes.NFL_DEPTHCHART : routes.DEPTHCHART}
                        type="button"
                        className="btn btn-primary btn-md me-2 shadow"
                    >
                        Depth Chart
                    </Link>
                    <button
                        className="btn btn-danger me-2"
                        onClick={ResetGameplan}
                    >
                        Reset Gameplan
                    </button>

                    <button
                        className={
                            isValid ? `btn btn-primary` : `btn btn-secondary`
                        }
                        disabled={!isValid}
                        onClick={SaveToast}
                    >
                        Save Gameplan
                    </button>
                </div>
            </div>
            <div className="row mb-2">
                <ul className="nav nav-tabs">
                    <GPTab
                        activeView={activeView}
                        gameplanType="Offensive Formations"
                        setActiveView={setActiveView}
                    />
                    <GPTab
                        activeView={activeView}
                        gameplanType="Offensive Distributions"
                        setActiveView={setActiveView}
                    />
                    <GPTab
                        activeView={activeView}
                        gameplanType="Defense"
                        setActiveView={setActiveView}
                    />
                    <GPTab
                        activeView={activeView}
                        gameplanType="Special Teams"
                        setActiveView={setActiveView}
                    />
                </ul>
            </div>
            {offensiveFormations.length > 0 &&
                defensiveFormations.length > 0 && (
                    <ViewFormationModal
                        Header={selectedFormation}
                        ID="viewFormationModal"
                    />
                )}
            {gameplan && activeView === 'Offensive Formations' && (
                <>
                    <SchemeModal
                        Header="Offensive Scheme Info"
                        ModalClass="modal-content"
                        ID="schemeModal"
                    />
                    <FormationModal
                        Header="Offensive Formation Info"
                        ModalClass="modal-content"
                        ID="formationModal"
                    />
                    <div className="row mt-1">
                        <div className="container offense-options">
                            <div className="row mb-1 d-flex flex-wrap">
                                <div
                                    className={`card ${
                                        isMobile ? '' : 'w-25'
                                    } text-start`}
                                >
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            Offensive Scheme:
                                            <button
                                                type="button"
                                                className="btn btn-sm"
                                                data-bs-toggle="modal"
                                                data-bs-target="#schemeModal"
                                            >
                                                <i className="bi bi-info-circle" />
                                            </button>
                                        </h5>
                                        <SchemeDropdown
                                            teamColors={teamColors}
                                            scheme={gameplan.OffensiveScheme}
                                            name="OffensiveScheme"
                                            options={OffensiveSchemeOptions}
                                            HandleTextChange={HandleTextChange}
                                        />

                                        {gameplan &&
                                            gameplan.OffensiveScheme && (
                                                <SchemeInfo
                                                    formationMap={FormationMap}
                                                    scheme={
                                                        gameplan.OffensiveScheme
                                                    }
                                                    isGPPage={true}
                                                />
                                            )}
                                    </div>
                                </div>
                                <div
                                    className={`card ${isMobile ? '' : 'w-75'}`}
                                >
                                    <div className="card-body text-start mb-2">
                                        <div className="row gap-2 mb-1">
                                            <div className="col-md-auto">
                                                <h5 className="card-title">
                                                    Offensive Formations
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#formationModal"
                                                    >
                                                        <i className="bi bi-info-circle" />
                                                    </button>
                                                </h5>
                                            </div>
                                            <div className="col ps-3 me-2">
                                                <FBAToggle
                                                    label="Default Offense"
                                                    value="DefaultOffense"
                                                    checkValue={
                                                        gameplan
                                                            ? gameplan.DefaultOffense
                                                            : false
                                                    }
                                                    change={HandleToggleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="row w-90 p-1 pt-2 border rounded-2 mb-2">
                                            <div className="col-auto">
                                                <h6 className="card-subtitle">
                                                    Traditional Run:{' '}
                                                    {tradRunTotal}%
                                                </h6>
                                            </div>
                                            <div className="col-auto">
                                                <h6 className="card-subtitle">
                                                    Option Run: {optRunTotal}%
                                                </h6>
                                            </div>
                                            <div className="col-auto">
                                                <h6 className="card-subtitle">
                                                    Pass: {passTotal}%
                                                </h6>
                                            </div>
                                            <div className="col-auto">
                                                <h6 className="card-subtitle">
                                                    RPO: {rpoTotal}%
                                                </h6>
                                            </div>
                                        </div>

                                        <div className="row gap-3">
                                            {offensiveFormations.length > 0 &&
                                                offensiveFormations.map(
                                                    (x, idx) => {
                                                        const num = idx + 1;
                                                        const initLabel = `OffForm${num}`;
                                                        const positions =
                                                            x.positions.join(
                                                                ', '
                                                            );
                                                        return (
                                                            <div className="col-md-2 gx-3 border rounded">
                                                                <h6 className="pt-2">
                                                                    {x.name}{' '}
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm"
                                                                        data-bs-toggle="modal"
                                                                        value={
                                                                            x.name
                                                                        }
                                                                        onClick={
                                                                            HandleFormation
                                                                        }
                                                                        data-bs-target="#viewFormationModal"
                                                                    >
                                                                        <i className="bi bi-info-circle" />
                                                                    </button>
                                                                </h6>
                                                                <p className="text-small">
                                                                    {positions}
                                                                </p>
                                                                <GameplanInputSm
                                                                    label="Weight"
                                                                    name={`${initLabel}Weight`}
                                                                    value={
                                                                        gameplan
                                                                            ? gameplan[
                                                                                  `${initLabel}Weight`
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    handleChange={
                                                                        HandleNumberChange
                                                                    }
                                                                    isDefault={
                                                                        true
                                                                    }
                                                                />
                                                                <GameplanInputSm
                                                                    label="Traditional Run"
                                                                    name={`${initLabel}TraditionalRun`}
                                                                    value={
                                                                        gameplan
                                                                            ? gameplan[
                                                                                  `${initLabel}TraditionalRun`
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    handleChange={
                                                                        HandleNumberChange
                                                                    }
                                                                    isDefault={
                                                                        isDefaultOffense
                                                                    }
                                                                />
                                                                <GameplanInputSm
                                                                    label="Option Run"
                                                                    name={`${initLabel}OptionRun`}
                                                                    value={
                                                                        gameplan
                                                                            ? gameplan[
                                                                                  `${initLabel}OptionRun`
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    handleChange={
                                                                        HandleNumberChange
                                                                    }
                                                                    isDefault={
                                                                        isDefaultOffense
                                                                    }
                                                                />
                                                                <GameplanInputSm
                                                                    label="Pass"
                                                                    name={`${initLabel}Pass`}
                                                                    value={
                                                                        gameplan
                                                                            ? gameplan[
                                                                                  `${initLabel}Pass`
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    handleChange={
                                                                        HandleNumberChange
                                                                    }
                                                                    isDefault={
                                                                        isDefaultOffense
                                                                    }
                                                                />
                                                                <GameplanInputSm
                                                                    label="RPO"
                                                                    name={`${initLabel}RPO`}
                                                                    value={
                                                                        gameplan
                                                                            ? gameplan[
                                                                                  `${initLabel}RPO`
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    handleChange={
                                                                        HandleNumberChange
                                                                    }
                                                                    isDefault={
                                                                        isDefaultOffense
                                                                    }
                                                                />
                                                            </div>
                                                        );
                                                    }
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {gameplan &&
                depthChart &&
                activeView === 'Offensive Distributions' && (
                    <>
                        <DistributionsModal
                            Header="Offensive Distributions Info"
                            ModalClass="modal-content"
                            ID="offensiveDistributionsModal"
                        />
                        <div className="row mt-1">
                            <div className="container offense-options">
                                <div className="row mb-1 d-flex flex-wrap">
                                    <div className="card text-start">
                                        <div className="card-body mb-1">
                                            <h5 className="card-title">
                                                Offensive Distributions
                                                <button
                                                    type="button"
                                                    className="btn btn-sm"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#offensiveDistributionsModal"
                                                >
                                                    <i className="bi bi-info-circle" />
                                                </button>
                                            </h5>
                                            <div className="row gap-3">
                                                <div
                                                    className={`${
                                                        isMobile ? '' : 'w-20'
                                                    } gx-3 border rounded`}
                                                >
                                                    <h6 className="pt-2 mb-1">
                                                        Target Distributions
                                                    </h6>
                                                    {TargetingLabels.map(
                                                        (x) => {
                                                            const name =
                                                                'Targeting' + x;
                                                            let max =
                                                                x === 'TE3'
                                                                    ? '0'
                                                                    : '60';
                                                            return (
                                                                <TargetInput
                                                                    name={name}
                                                                    label={x}
                                                                    value={
                                                                        gameplan[
                                                                            name
                                                                        ]
                                                                    }
                                                                    isNFL={
                                                                        isNFL
                                                                    }
                                                                    targetDepth={
                                                                        gameplan[
                                                                            `TargetDepth${x}`
                                                                        ]
                                                                            ? gameplan[
                                                                                  `TargetDepth${x}`
                                                                              ]
                                                                            : 'None'
                                                                    }
                                                                    dc={
                                                                        depthChart
                                                                    }
                                                                    handleChange={
                                                                        HandleNumberChange
                                                                    }
                                                                    handleClick={
                                                                        HandleTextChange
                                                                    }
                                                                    isDefault={
                                                                        isDefaultOffense
                                                                    }
                                                                />
                                                            );
                                                        }
                                                    )}
                                                </div>
                                                <div
                                                    className={`${
                                                        isMobile ? '' : 'w-80'
                                                    } gx-3 row`}
                                                >
                                                    <div className="col-xl-3 col-lg-3 col-md-4 gx-3 border rounded mb-2">
                                                        <h6 className="pt-2">
                                                            Running
                                                            Distributions
                                                        </h6>
                                                        <RunInput
                                                            isNFL={isNFL}
                                                            label="QB"
                                                            name={`RunnerDistributionQB`}
                                                            value={
                                                                gameplan
                                                                    ? gameplan[
                                                                          'RunnerDistributionQB'
                                                                      ]
                                                                    : 0
                                                            }
                                                            handleChange={
                                                                HandleNumberChange
                                                            }
                                                            dc={depthChart}
                                                            isDefault={
                                                                isDefaultOffense
                                                            }
                                                        />
                                                        <RunInput
                                                            isNFL={isNFL}
                                                            label="RB1"
                                                            name={`RunnerDistributionRB1`}
                                                            value={
                                                                gameplan
                                                                    ? gameplan[
                                                                          'RunnerDistributionRB1'
                                                                      ]
                                                                    : 0
                                                            }
                                                            handleChange={
                                                                HandleNumberChange
                                                            }
                                                            dc={depthChart}
                                                            isDefault={
                                                                isDefaultOffense
                                                            }
                                                        />
                                                        <RunInput
                                                            isNFL={isNFL}
                                                            label="RB2"
                                                            name={`RunnerDistributionRB2`}
                                                            value={
                                                                gameplan
                                                                    ? gameplan[
                                                                          'RunnerDistributionRB2'
                                                                      ]
                                                                    : 0
                                                            }
                                                            handleChange={
                                                                HandleNumberChange
                                                            }
                                                            dc={depthChart}
                                                            isDefault={
                                                                isDefaultOffense
                                                            }
                                                        />
                                                        <RunInput
                                                            isNFL={isNFL}
                                                            label="RB3"
                                                            name={`RunnerDistributionRB3`}
                                                            value={
                                                                gameplan
                                                                    ? gameplan[
                                                                          'RunnerDistributionRB3'
                                                                      ]
                                                                    : 0
                                                            }
                                                            handleChange={
                                                                HandleNumberChange
                                                            }
                                                            dc={depthChart}
                                                            isDefault={
                                                                isDefaultOffense
                                                            }
                                                        />
                                                        <RunInput
                                                            isNFL={isNFL}
                                                            label="FB1"
                                                            name={`RunnerDistributionFB1`}
                                                            value={
                                                                gameplan
                                                                    ? gameplan[
                                                                          'RunnerDistributionFB1'
                                                                      ]
                                                                    : 0
                                                            }
                                                            handleChange={
                                                                HandleNumberChange
                                                            }
                                                            dc={depthChart}
                                                            isDefault={
                                                                isDefaultOffense
                                                            }
                                                        />
                                                        <RunInput
                                                            isNFL={isNFL}
                                                            label="FB2"
                                                            name={`RunnerDistributionFB2`}
                                                            value={
                                                                gameplan
                                                                    ? gameplan[
                                                                          'RunnerDistributionFB2'
                                                                      ]
                                                                    : 0
                                                            }
                                                            handleChange={
                                                                HandleNumberChange
                                                            }
                                                            dc={depthChart}
                                                            isDefault={
                                                                isDefaultOffense
                                                            }
                                                        />
                                                        <TargetInput
                                                            isNFL={isNFL}
                                                            label={
                                                                gameplan[
                                                                    `RunnerDistributionWRPosition`
                                                                ]
                                                                    ? gameplan[
                                                                          `RunnerDistributionWRPosition`
                                                                      ]
                                                                    : 'WR1'
                                                            }
                                                            name={`RunnerDistributionWR`}
                                                            value={
                                                                gameplan
                                                                    ? gameplan[
                                                                          'RunnerDistributionWR'
                                                                      ]
                                                                    : 0
                                                            }
                                                            targetDepth={
                                                                gameplan[
                                                                    `RunnerDistributionWRPosition`
                                                                ]
                                                                    ? gameplan[
                                                                          `RunnerDistributionWRPosition`
                                                                      ]
                                                                    : 'None'
                                                            }
                                                            dc={depthChart}
                                                            handleChange={
                                                                HandleNumberChange
                                                            }
                                                            handleClick={
                                                                HandleTextChange
                                                            }
                                                            isDefault={
                                                                isDefaultOffense
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col-xl-auto col-lg-auto col-md-4 gx-3 border rounded mb-2">
                                                        <h6 className="pt-2">
                                                            Run Type
                                                            Distributions
                                                        </h6>
                                                        {RunPlayLabels.map(
                                                            (x) => {
                                                                const name =
                                                                    'Run' + x;
                                                                return (
                                                                    <GameplanInputSm
                                                                        name={
                                                                            name
                                                                        }
                                                                        label={
                                                                            x
                                                                        }
                                                                        value={
                                                                            gameplan
                                                                                ? gameplan[
                                                                                      name
                                                                                  ]
                                                                                : 0
                                                                        }
                                                                        handleChange={
                                                                            HandleNumberChange
                                                                        }
                                                                        isDefault={
                                                                            isDefaultOffense
                                                                        }
                                                                    />
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                    <div className="col-xl-2 col-lg-4 col-md-4 gx-3 border rounded mb-2">
                                                        <h6 className="pt-2">
                                                            Option Distributions
                                                        </h6>
                                                        {OptionPlayLabels.map(
                                                            (x) => {
                                                                return (
                                                                    <GameplanInputSm
                                                                        name={x}
                                                                        label={
                                                                            x
                                                                        }
                                                                        value={
                                                                            gameplan
                                                                                ? gameplan[
                                                                                      x
                                                                                  ]
                                                                                : 0
                                                                        }
                                                                        handleChange={
                                                                            HandleNumberChange
                                                                        }
                                                                        isDefault={
                                                                            isDefaultOffense
                                                                        }
                                                                    />
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                    <div className="col-xl-2 col-lg-4 col-md-4 gx-3 border rounded mb-2">
                                                        <h6 className="pt-2">
                                                            Pass Type
                                                            Distributions
                                                        </h6>
                                                        {PassPlayLabels.map(
                                                            (x, idx) => {
                                                                const name =
                                                                    'Pass' + x;
                                                                let label = x;
                                                                if (idx === 0) {
                                                                    label =
                                                                        'Short';
                                                                } else if (
                                                                    idx === 1
                                                                ) {
                                                                    label =
                                                                        'Medium';
                                                                } else if (
                                                                    idx === 5
                                                                ) {
                                                                    label =
                                                                        'Play Action Medium';
                                                                } else if (
                                                                    idx === 6
                                                                ) {
                                                                    label =
                                                                        'Play Action Long';
                                                                } else if (
                                                                    idx === 7
                                                                ) {
                                                                    label =
                                                                        'Play Action Deep';
                                                                }

                                                                return (
                                                                    <div className="col-auto d-flex">
                                                                        <GameplanInputSm
                                                                            name={
                                                                                name
                                                                            }
                                                                            label={
                                                                                label
                                                                            }
                                                                            value={
                                                                                gameplan[
                                                                                    name
                                                                                ]
                                                                            }
                                                                            handleChange={
                                                                                HandleNumberChange
                                                                            }
                                                                            isDefault={
                                                                                isDefaultOffense
                                                                            }
                                                                        />
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                    <div className="col-xl-2 col-lg-4 col-md-4 gx-3 border rounded mb-1">
                                                        <h6 className="pt-2">
                                                            RPO Distributions
                                                        </h6>
                                                        {RPOLabels.map((x) => {
                                                            return (
                                                                <GameplanInputSm
                                                                    name={x}
                                                                    label={x}
                                                                    value={
                                                                        gameplan
                                                                            ? gameplan[
                                                                                  x
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    handleChange={
                                                                        HandleNumberChange
                                                                    }
                                                                    isDefault={
                                                                        isDefaultOffense
                                                                    }
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            {gameplan && activeView === 'Defense' && (
                <>
                    <DefensiveSchemeModal
                        Header="Defensive Scheme Info"
                        ModalClass="modal-content"
                        ID="defensiveSchemeModal"
                    />
                    <div className="row mt-1">
                        <div className="container defense-options">
                            <div className="row mb-1 d-flex flex-wrap">
                                <div
                                    className={`card ${
                                        isMobile ? '' : 'w-15'
                                    } text-start`}
                                >
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            Defensive Scheme
                                            <button
                                                type="button"
                                                className="btn btn-sm"
                                                data-bs-toggle="modal"
                                                data-bs-target="#defensiveSchemeModal"
                                            >
                                                <i className="bi bi-info-circle" />
                                            </button>
                                        </h5>
                                        <SchemeDropdown
                                            teamColors={teamColors}
                                            scheme={gameplan.DefensiveScheme}
                                            name="DefensiveScheme"
                                            options={DefensiveSchemeOptions}
                                            HandleTextChange={HandleTextChange}
                                        />
                                        {gameplan.DefensiveScheme && (
                                            <SchemeInfo
                                                formationMap={FormationMap}
                                                scheme={
                                                    gameplan.DefensiveScheme
                                                }
                                                isGPPage={true}
                                            />
                                        )}
                                    </div>
                                </div>
                                <div
                                    className={`card ${
                                        isMobile ? '' : 'w-85'
                                    } text-start`}
                                >
                                    <div className="card-body text-start mb-1">
                                        <div className="row gap-2">
                                            <div className="col-md-auto">
                                                <h5 className="card-title">
                                                    Defensive Formations
                                                </h5>
                                            </div>
                                            <div className="col ps-3 me-2">
                                                <FBAToggle
                                                    label="Default Defense"
                                                    value="DefaultDefense"
                                                    checkValue={
                                                        gameplan
                                                            ? gameplan.DefaultDefense
                                                            : false
                                                    }
                                                    change={HandleToggleChange}
                                                />
                                            </div>
                                        </div>

                                        {opponentScheme && (
                                            <OpposingSchemeRow
                                                scheme={opponentScheme}
                                            />
                                        )}

                                        <div className="row gap-2">
                                            {opponentScheme &&
                                                opposingFormation.map(
                                                    (x, idx) => {
                                                        const num = idx + 1;
                                                        const initLabel = `DefFormation${num}`;
                                                        const opposingPositions =
                                                            x.positions.join(
                                                                ', '
                                                            );
                                                        const defFormationIdx =
                                                            defensiveFormations.findIndex(
                                                                (x) =>
                                                                    x.name ===
                                                                    gameplan[
                                                                        initLabel
                                                                    ]
                                                            );
                                                        const defFormation =
                                                            defFormationIdx > -1
                                                                ? defensiveFormations[
                                                                      defFormationIdx
                                                                  ]
                                                                : {
                                                                      name: '',
                                                                      positions:
                                                                          []
                                                                  };
                                                        const positions =
                                                            defFormationIdx > -1
                                                                ? GetDefensivePositions(
                                                                      defFormation.positions
                                                                  )
                                                                : [];

                                                        return (
                                                            <div className="col-md pt-2 border rounded">
                                                                <h6>
                                                                    Opposing
                                                                    Formation:
                                                                </h6>
                                                                <p className="text-small">
                                                                    {x.name}
                                                                </p>
                                                                <p className="text-small">
                                                                    <small>
                                                                        {
                                                                            opposingPositions
                                                                        }
                                                                    </small>
                                                                </p>
                                                                <div className="dropdown">
                                                                    <button
                                                                        className={
                                                                            schemeDropdownClass
                                                                        }
                                                                        type="button"
                                                                        id="dropdownMenuButton1"
                                                                        data-bs-toggle="dropdown"
                                                                        aria-expanded="false"
                                                                        disabled={
                                                                            isDefaultDefense
                                                                        }
                                                                    >
                                                                        {
                                                                            gameplan[
                                                                                initLabel
                                                                            ]
                                                                        }
                                                                    </button>
                                                                    <ul
                                                                        className="dropdown-menu"
                                                                        aria-labelledby="dropdownMenuButton1"
                                                                    >
                                                                        {defensiveFormations.map(
                                                                            (
                                                                                x
                                                                            ) => (
                                                                                <DropdownItem
                                                                                    name={
                                                                                        initLabel
                                                                                    }
                                                                                    id={
                                                                                        initLabel
                                                                                    }
                                                                                    value={
                                                                                        x.name
                                                                                    }
                                                                                    click={
                                                                                        HandleTextChange
                                                                                    }
                                                                                />
                                                                            )
                                                                        )}
                                                                    </ul>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm"
                                                                        data-bs-toggle="modal"
                                                                        value={
                                                                            gameplan[
                                                                                initLabel
                                                                            ]
                                                                        }
                                                                        onClick={
                                                                            HandleFormation
                                                                        }
                                                                        data-bs-target="#viewFormationModal"
                                                                    >
                                                                        <i className="bi bi-info-circle" />
                                                                    </button>
                                                                </div>
                                                                <p className="text-small">
                                                                    {positions}
                                                                </p>
                                                                <GameplanInputSm
                                                                    label="Run to Pass"
                                                                    name={`${initLabel}RunToPass`}
                                                                    value={
                                                                        gameplan
                                                                            ? gameplan[
                                                                                  `${initLabel}RunToPass`
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    handleChange={
                                                                        HandleNumberChange
                                                                    }
                                                                    isDefault={
                                                                        isDefaultDefense
                                                                    }
                                                                />
                                                                <GameplanInputSm
                                                                    label="Blitz Weight"
                                                                    name={`${initLabel}BlitzWeight`}
                                                                    value={
                                                                        gameplan
                                                                            ? gameplan[
                                                                                  `${initLabel}BlitzWeight`
                                                                              ]
                                                                            : 0
                                                                    }
                                                                    handleChange={
                                                                        HandleNumberChange
                                                                    }
                                                                    isDefault={
                                                                        isDefaultDefense
                                                                    }
                                                                />
                                                                <h6>
                                                                    Blitz
                                                                    Aggression
                                                                </h6>
                                                                <SchemeDropdown
                                                                    teamColors={
                                                                        teamColors
                                                                    }
                                                                    scheme={
                                                                        gameplan[
                                                                            `${initLabel}BlitzAggression`
                                                                        ]
                                                                    }
                                                                    name={`${initLabel}BlitzAggression`}
                                                                    options={
                                                                        BlitzAggressivenessOptions
                                                                    }
                                                                    HandleTextChange={
                                                                        HandleTextChange
                                                                    }
                                                                    isDefault={
                                                                        isDefaultDefense
                                                                    }
                                                                />
                                                            </div>
                                                        );
                                                    }
                                                )}

                                            <div className="col-md-2 pt-2 border rounded">
                                                <h6>Focus Plays</h6>
                                                {selectedFocusPlays.length >
                                                    0 && (
                                                    <p>
                                                        {selectedFocusPlays.map(
                                                            (x, idx) => (
                                                                <span>
                                                                    {x}
                                                                    {idx <
                                                                    selectedFocusPlays.length -
                                                                        1
                                                                        ? ', '
                                                                        : ''}
                                                                </span>
                                                            )
                                                        )}
                                                    </p>
                                                )}
                                                <Select
                                                    options={focusPlayOptions}
                                                    isMulti={true}
                                                    className="basic-multi-select btn-dropdown-width-gp z-index-1"
                                                    classNamePrefix="select"
                                                    onChange={ChangeFocusPlays}
                                                />
                                            </div>
                                            <div className="w-86 border rounded">
                                                <h6 className="pt-2">
                                                    Defensive Settings
                                                </h6>
                                                <div className="row d-flex align-items-center">
                                                    <div className="col-auto ps-3 me-2">
                                                        <FBAToggle
                                                            label="Blitz Safeties"
                                                            value="BlitzSafeties"
                                                            checkValue={
                                                                gameplan
                                                                    ? gameplan.BlitzSafeties
                                                                    : false
                                                            }
                                                            change={
                                                                HandleToggleChange
                                                            }
                                                        />
                                                        <FBAToggle
                                                            label="Blitz Corners"
                                                            value="BlitzCorners"
                                                            checkValue={
                                                                gameplan
                                                                    ? gameplan.BlitzCorners
                                                                    : false
                                                            }
                                                            change={
                                                                HandleToggleChange
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col p-2 ms-2 me-2">
                                                        <InputRange
                                                            label="Pitch Focus"
                                                            name="PitchFocus"
                                                            value={pitchFocus}
                                                            change={
                                                                HandleRangeChange
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col p-2 ms-2 me-2">
                                                        <InputRange
                                                            label="Dive Focus"
                                                            name="DiveFocus"
                                                            value={diveFocus}
                                                            change={
                                                                HandleRangeChange
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col p-2 ms-2 me-2">
                                                        <h6>
                                                            Linebacker Coverage
                                                        </h6>
                                                        <SchemeDropdown
                                                            teamColors={
                                                                teamColors
                                                            }
                                                            scheme={
                                                                gameplan.LinebackerCoverage
                                                            }
                                                            name="LinebackerCoverage"
                                                            options={
                                                                CoverageOptions
                                                            }
                                                            HandleTextChange={
                                                                HandleTextChange
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col p-2 ms-2 me-2">
                                                        <h6>
                                                            Corners Coverage
                                                        </h6>
                                                        <SchemeDropdown
                                                            teamColors={
                                                                teamColors
                                                            }
                                                            scheme={
                                                                gameplan.CornersCoverage
                                                            }
                                                            name="CornersCoverage"
                                                            options={
                                                                CoverageOptions
                                                            }
                                                            HandleTextChange={
                                                                HandleTextChange
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col p-2 ms-2 me-2">
                                                        <h6>
                                                            Safeties Coverage
                                                        </h6>
                                                        <SchemeDropdown
                                                            teamColors={
                                                                teamColors
                                                            }
                                                            scheme={
                                                                gameplan.SafetiesCoverage
                                                            }
                                                            name="SafetiesCoverage"
                                                            options={
                                                                CoverageOptions
                                                            }
                                                            HandleTextChange={
                                                                HandleTextChange
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col p-2 ms-2 me-2">
                                                        <h6>
                                                            Double Team Coverage
                                                        </h6>
                                                        <SchemeDropdown
                                                            teamColors={
                                                                teamColors
                                                            }
                                                            scheme={
                                                                gameplan.DoubleTeam
                                                            }
                                                            name="DoubleTeam"
                                                            options={
                                                                opponentTargets
                                                            }
                                                            HandleTextChange={
                                                                HandleTextChange
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {gameplan && activeView === 'Special Teams' && (
                <>
                    <div className="row mt-1 justify-content-start">
                        <div className="container st-options">
                            <div className="row mb-1 d-flex flex-wrap">
                                <div className="card text-start">
                                    <div className="card-body">
                                        <h5>Special Team Options</h5>
                                        <div className="row gap-2">
                                            <div className="col-auto">
                                                <GameplanInputItem
                                                    name="MaximumFGDistance"
                                                    label="Maximum Field Goal Distance"
                                                    value={
                                                        gameplan &&
                                                        gameplan.MaximumFGDistance
                                                    }
                                                    min={'15'}
                                                    max={'85'}
                                                    handleChange={
                                                        HandleNumberChange
                                                    }
                                                />
                                            </div>
                                            <div className="col-auto">
                                                <GameplanInputItem
                                                    name="GoFor4AndShort"
                                                    label="Go For It on 4th and Short"
                                                    value={
                                                        gameplan &&
                                                        gameplan.GoFor4AndShort
                                                    }
                                                    min={'0'}
                                                    max={'85'}
                                                    handleChange={
                                                        HandleNumberChange
                                                    }
                                                />
                                            </div>
                                            <div className="col-auto">
                                                <GameplanInputItem
                                                    name="GoFor4AndLong"
                                                    label="Go For It on 4th and Long"
                                                    value={
                                                        gameplan &&
                                                        gameplan.GoFor4AndLong
                                                    }
                                                    min={'0'}
                                                    max={'85'}
                                                    handleChange={
                                                        HandleNumberChange
                                                    }
                                                />
                                            </div>
                                            <div className="col-auto">
                                                <GameplanInputItem
                                                    name="PrimaryHB"
                                                    label="Primary HB"
                                                    value={
                                                        gameplan &&
                                                        gameplan.PrimaryHB
                                                    }
                                                    min={'0'}
                                                    max={'100'}
                                                    handleChange={
                                                        HandleNumberChange
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const mapStateToProps = ({
    user: { currentUser },
    cfbTeam: { cfbTeam },
    nflTeam: { nflTeam }
}) => ({
    currentUser,
    cfbTeam,
    nflTeam
});

export default connect(mapStateToProps)(CFBGameplan);
