import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useMediaQuery } from 'react-responsive';
import { Timestamp } from 'firebase/firestore';
import { BBATeamDropdown } from '../../../_Common/Dropdown';
import { useFirestore } from '../../../../Firebase/firebase';
import BBADraftService from '../../../../_Services/simNBA/BBADraftService';
import { connect } from 'react-redux';
import { getLogo } from '../../../../Constants/getLogo';
import { Spinner } from '../../../_Common/Spinner';
import { NBADrafteeRow } from './NBADrafteeRow';
import { GetTableHoverClass } from '../../../../Constants/CSSClassHelper';
import { NBAScoutPlayerRow } from './NBAScoutPlayerRow';
import { NBADraftHelpModal, ScoutingModal } from './NBADraftModals';
import { MapObjOptions } from '../../../../_Utility/filterHelper';
import { BBPositionList } from '../../../../Constants/BBAConstants';
import {
    GetCurrentDraftPick,
    GetPickTeamLogo,
    GetRecentlyDraftedPlayer,
    GetViewablePlayersList,
    useDraftMap,
    GetPicksByCurrentRound,
    GetNBACurrentDraftPickIdx
} from '../../../../_Hooks/DraftHooks';
import {
    GetPauseTimer,
    GetResetTimer,
    GetStartTimer
} from '../../../../_Utility/DraftHelper';
import { WarRoomPick, WarRoomTab } from '../../../_Common/DraftComponents';
import {
    NBAArchetypesList,
    SimNBA
} from '../../../../Constants/CommonConstants';
import InfiniteScroll from 'react-infinite-scroll-component';

const NBADraftPage = ({ currentUser, cbb_Timestamp, viewMode }) => {
    // Services
    const _draftService = new BBADraftService();
    // Admin Values
    const [data, updateData] = useFirestore(
        'nbadraftstate',
        'YfIofzhpUVSJITQpBrUA'
    );
    console.log({ data });
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [endAt, setEndTime] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(300);
    const [warRoom, setWarRoom] = useState(null);
    const [userWarRoom, setUserWarRoom] = useState(null);
    const [scoutMap, setScoutMap] = useState({});
    const [nbaTeams, setNBATeams] = useState([]);
    const positions = MapObjOptions(BBPositionList);
    const archetypes = MapObjOptions(NBAArchetypesList);
    const [selectedPositions, setPositions] = useState('');
    const [selectedArchetypes, setArchetypes] = useState('');
    const [colleges, setColleges] = useState([]);
    const [selectedColleges, setSelectedColleges] = useState('');
    const [mobileView, setMobileView] = useState('DRAFT');
    const [activeView, setActiveView] = useState('War Room');
    const [allDraftablePlayers, setAllDraftablePlayers] = useState([]);
    const [viewWidth, setViewWidth] = useState(window.innerWidth);
    const [viewCount, setViewCount] = useState(100);
    const [modalDraftee, setModalDraftee] = useState(null);
    const {
        allDraftPicks,
        currentPick,
        currentRound,
        nextPick,
        recentlyDraftedPlayerID,
        seconds,
        startAt,
        exportComplete,
        endTime
    } = data || {};
    const tableHoverClass = GetTableHoverClass(viewMode);

    useEffect(() => {
        if (!endTime || isPaused) return;
        const updateCountdown = () => {
            const now = new Date();
            const endTimeJS = endTime.toDate();
            const secondsLeft = Math.round((endTimeJS - now) / 1000);
            setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);
        };

        updateCountdown(); // Immediately update the countdown
        const intervalId = setInterval(updateCountdown, 1000); // Then update every second

        return () => clearInterval(intervalId);
    }, [endTime, isPaused]);

    // For mobile
    useEffect(() => {
        if (!viewWidth) {
            setViewWidth(window.innerWidth);
        }
    }, [viewWidth]);

    const isMobile = useMediaQuery({ query: `(max-width:851px)` });

    const currentDraftPicks = GetPicksByCurrentRound(
        allDraftPicks,
        currentRound
    );

    const recentlyDraftedPlayer = GetRecentlyDraftedPlayer(
        allDraftablePlayers,
        recentlyDraftedPlayerID
    );

    const draftMap = useDraftMap(allDraftPicks);
    const currentDraftPickIdx = GetNBACurrentDraftPickIdx(
        allDraftPicks,
        currentPick,
        currentRound
    );
    const currentDraftPick = GetCurrentDraftPick(
        allDraftPicks,
        currentDraftPickIdx,
        currentPick,
        currentRound
    );
    const nextDraftPickIdx = GetNBACurrentDraftPickIdx(
        allDraftPicks,
        nextPick,
        currentRound
    );

    const nextDraftPick = GetCurrentDraftPick(
        allDraftPicks,
        nextDraftPickIdx,
        nextPick,
        currentRound
    );

    const currentPickTeamLogo = GetPickTeamLogo(
        currentDraftPick,
        currentUser.IsRetro
    );

    const nextPickTeamLogo = GetPickTeamLogo(
        nextDraftPick,
        currentUser.IsRetro
    );

    const viewablePlayers = GetViewablePlayersList(
        allDraftablePlayers,
        selectedPositions,
        selectedColleges,
        selectedArchetypes,
        viewCount
    );

    // NBA Draft Room State -- get Firebase
    // Current Round
    // Current Pick
    // Start Time
    const StartTimer = () => {
        GetStartTimer(data, currentPick, timeLeft, isPaused, updateData);
    };

    // End Time
    const PauseTimer = () => {
        GetPauseTimer(data, timeLeft, updateData);
    };

    const ResetTimer = () => {
        GetResetTimer(data, updateData);
    };

    // Options for filters
    // Hooks
    // Mobile Functionality

    // Use Effects
    useEffect(() => {
        if (currentUser) {
            const adminStatus = currentUser.bba_roleID === 'Admin';
            if (!warRoom && nbaTeams.length === 0) {
                GetDraftPageData(currentUser.NBATeamID);
            }
            setIsAdmin(() => adminStatus);
        }
    }, [currentUser, warRoom, nbaTeams]);

    useEffect(() => {
        if (data) {
            if (data.endTime) {
                setEndTime(() => data.endTime.toDate());
            }
            setIsPaused(() => data.isPaused);
            setTimeLeft(() => data.seconds);
            if (data.startTime) {
                setStartTime(() => data.startAt.toDate());
            }
        }
    }, [data]);

    // Click Functionality
    const adminSelectTeam = async (team) => {
        if (isAdmin) {
            alert('Sorry, but this is something only Tuscan can do for now.');
            return;
        }
        setIsLoading(() => true);
        await GetDraftPageData(team.ID);
    };

    const selectMobileView = (event) => {
        event.preventDefault();

        const { value } = event.target;
        setMobileView(() => value);
    };

    const addPlayerToScoutingBoard = async (player) => {
        const wr = { ...warRoom };

        const dto = { PlayerID: player.ID, TeamID: wr.TeamID };

        const res = await _draftService.CreateScoutingProfile(dto);

        if (res.ok) {
            const newProfile = await res.json();
            const newProfileWithDraftee = { ...newProfile, Draftee: player };
            if (wr.ScoutProfiles && Array.isArray(wr.ScoutProfiles)) {
                wr.ScoutProfiles.push(newProfileWithDraftee);
            } else {
                wr.ScoutProfiles = [newProfileWithDraftee];
            }
            setWarRoom(() => wr);
        }
        const keyCode = `${player.ID}`;
        const scoutingMap = { ...scoutMap };
        scoutingMap[keyCode] = true;
        setScoutMap(() => scoutingMap);
    };

    const removePlayerFromBoard = async (profile) => {
        const wr = { ...warRoom };
        const res = await _draftService.RemovePlayerFromBoard(profile.ID);
        if (res.ok) {
            wr.ScoutProfiles = warRoom.ScoutProfiles.filter(
                (x) => x.PlayerID !== profile.PlayerID
            );
            setWarRoom(() => wr);
            const keyCode = `${profile.Draftee.FirstName}${profile.Draftee.LastName}${profile.Draftee.Position}${profile.Draftee.State}${profile.Draftee.Country}`;
            const scoutingMap = { ...scoutMap };
            scoutingMap[keyCode] = true;
            setScoutMap(() => scoutingMap);
        }
    };

    const revealAttribute = async (idx, profile, attr, points) => {
        const wr = { ...warRoom };
        const dto = {
            ScoutProfileID: profile.ID,
            Attribute: attr,
            Points: Number(points),
            TeamID: wr.TeamID
        };

        const res = await _draftService.RevealAttribute(dto);
        if (res) {
            if (attr === 'Shooting2') {
                wr.ScoutProfiles[idx].ShowShooting2 = true;
            } else if (attr === 'Shooting3') {
                wr.ScoutProfiles[idx].ShowShooting3 = true;
            } else if (attr === 'FreeThrow') {
                wr.ScoutProfiles[idx].ShowFreeThrow = true;
            } else if (attr === 'Finishing') {
                wr.ScoutProfiles[idx].ShowFinishing = true;
            } else if (attr === 'Ballwork') {
                wr.ScoutProfiles[idx].ShowBallwork = true;
            } else if (attr === 'Rebounding') {
                wr.ScoutProfiles[idx].ShowRebounding = true;
            } else if (attr === 'InteriorDefense') {
                wr.ScoutProfiles[idx].ShowInteriorDefense = true;
            } else if (attr === 'PerimeterDefense') {
                wr.ScoutProfiles[idx].ShowPerimeterDefense = true;
            } else if (attr === 'Potential') {
                wr.ScoutProfiles[idx].ShowPotential = true;
            }
            wr.ScoutProfiles[idx].ShowCount += 1;
            wr.SpentPoints = Number(wr.SpentPoints) + Number(points);
            setWarRoom(() => wr);
        } else {
            alert(
                `Alert: Could not reveal ${attr} Attribute for Player ${profile.Draftee.FirstName} ${profile.Draftee.LastName}`
            );
        }
    };

    const draftPlayer = async (player) => {
        const draftedPlayerInfo = {
            SelectedPlayerID: player.ID,
            SelectedPlayerName: `${player.FirstName} ${player.LastName}`,
            SelectedPlayerPosition: player.Position
        };
        const draftPicks = { ...allDraftPicks };
        draftPicks[currentRound][currentDraftPickIdx] = {
            ...draftPicks[currentRound][currentDraftPickIdx],
            ...draftedPlayerInfo
        };

        let currRound = currentRound;
        if (currentDraftPickIdx === draftPicks[currentRound].length - 1) {
            currRound += 1;
        }

        const theNextPick = nextPick;
        const finalDraftPick =
            draftPicks[2][draftPicks[2].length - 1].DraftNumber;
        const finalPick = currentPick === finalDraftPick;
        if (finalPick) {
            currRound = 1;
        }

        // Update Player Info
        const draftablePlayers = [...allDraftablePlayers];
        const teamInfoFromDP = {
            DraftPickID: draftPicks[currentRound][currentDraftPickIdx].ID,
            DraftPick: `${draftPicks[currentRound][currentDraftPickIdx].DraftNumber}`,
            DraftedTeamID: draftPicks[currentRound][currentDraftPickIdx].TeamID,
            DraftedTeamAbbr: draftPicks[currentRound][currentDraftPickIdx].Team
        };
        const draftedPlayerIDX = draftablePlayers.findIndex(
            (x) => x.ID === player.ID
        );

        if (draftedPlayerIDX === -1) {
            alert(
                `ERROR: COULD NOT FIND ${player.ID} ${player.FirstName} ${player.LastName}`
            );
            return;
        }
        draftablePlayers[draftedPlayerIDX] = {
            ...draftablePlayers[draftedPlayerIDX],
            ...teamInfoFromDP
        };

        const newData = {
            ...data,
            currentPick: theNextPick,
            nextPick: theNextPick + 1,
            currentRound: currRound,
            recentlyDraftedPlayerID: player.ID,
            allDraftPicks: draftPicks,
            draftingTeam: nextDraftPick.Team,
            draftingTeamID: nextDraftPick.TeamID,
            isPaused: true
        };
        updateData(newData);
        setTimeout(() => {
            const endTime = Timestamp.fromDate(
                new Date(Date.now() + seconds * 1000)
            );
            let seconds = 0;
            if (currentPick < 32) {
                seconds = 300;
            } else {
                seconds = 120;
            }
            const resetTimerData = {
                ...newData,
                endTime,
                isPaused: finalPick,
                seconds,
                startAt: Timestamp.fromDate(new Date(Date.now()))
            };
            updateData(resetTimerData);
        }, 10000);
    };

    const exportDraftedPlayers = async () => {
        if (exportComplete) {
            return;
        }
        const draftPickMap = { ...allDraftPicks };
        const draftpicks = [];
        for (let i = 1; i < 3; i++) {
            const roundOfPicks = draftPickMap[i];
            for (let j = 0; j < roundOfPicks.length; j++) {
                const pick = roundOfPicks[j];
                draftpicks.push(pick);
            }
        }
        const dto = { DraftPicks: draftpicks };

        const res = await _draftService.ExportPlayers(dto);

        if (res) {
            const newData = {
                ...data,
                exportComplete: true
            };
            updateData(newData);
        }
    };

    // API Calls
    const GetDraftPageData = async (id) => {
        const res = await _draftService.GetDraftPageData(id);
        const { ScoutProfiles } = res.WarRoom;
        const scoutingMap = {};
        for (let i = 0; i < ScoutProfiles.length; i++) {
            const profile = ScoutProfiles[i];
            if (profile.Draftee) {
                const { Draftee } = profile;
                const { ID } = Draftee;
                scoutingMap[ID] = true;
            }
        }
        const collegeList = [];
        for (let i = 0; i < res.CollegeTeams.length; i++) {
            const college = res.CollegeTeams[i];
            const collegeObj = {
                name: college.Team,
                abbr: college.Abbr
            };
            collegeList.push(collegeObj);
        }
        setColleges(MapObjOptions(collegeList));

        // In the event we need to re-upload the draft picks
        // const { AllDraftPicks } = res;
        // const allDraftObj = {};
        // for (let i = 0; i < AllDraftPicks.length; i++) {
        //     const num = i + 1;
        //     allDraftObj[num] = AllDraftPicks[i];
        // }
        // const newData = {
        //     ...data,
        //     allDraftPicks: allDraftObj
        // };
        // updateData(newData);
        setWarRoom(() => res.WarRoom);
        setAllDraftablePlayers(() => res.DraftablePlayers);
        if (res.WarRoom.ID === currentUser.NBATeamID) {
            setUserWarRoom(() => res.WarRoom);
        }
        if (nbaTeams.length === 0) {
            setNBATeams(() => res.NBATeams);
        }
        setScoutMap(() => scoutingMap);
        setIsLoading(() => false);
    };

    // Table Functions
    const loadRecords = () => {
        setViewCount((x) => x + 100);
    };

    const loadMoreRecords = () => {
        setTimeout(() => loadRecords(), 500);
    };

    const ChangeArchetypes = (options) => {
        const opts = [...options.map((x) => x.value)];
        setArchetypes(opts);
    };

    const ChangeColleges = (options) => {
        const opts = [...options.map((x) => x.value)];
        setSelectedColleges(opts);
    };

    // Secondary Components
    const ChangePositions = (options) => {
        const opts = [...options.map((x) => x.value)];
        setPositions(opts);
    };

    return (
        <div className="container-fluid mt-3">
            {isLoading ? (
                <Spinner />
            ) : (
                <>
                    <div className="row draft-room-header">
                        <div className="col-2 justify-content-start ms-end">
                            <h3>NBA Draft Room</h3>
                        </div>

                        {currentDraftPickIdx > -1 && (
                            <>
                                <div className="col-auto px-4">
                                    Current Pick: {currentPick}
                                </div>
                                <div className="col-auto px-4">
                                    Team Drafting:{' '}
                                    <img
                                        src={currentPickTeamLogo}
                                        className="object-fit"
                                        height="50px"
                                        width="50px"
                                        alt="Current Team Logo"
                                    />
                                </div>
                            </>
                        )}
                        {nextDraftPickIdx > -1 && (
                            <div className="col-auto px-4">
                                Next Team:{' '}
                                <img
                                    src={nextPickTeamLogo}
                                    className="object-fit"
                                    height="50px"
                                    width="50px"
                                    alt="Next Team Logo"
                                />
                            </div>
                        )}
                        {!currentDraftPick && !nextDraftPick && (
                            <div className="col-auto px-4">
                                <h6>Draft is Complete!</h6>
                                <button
                                    className="btn btn-outline-primary"
                                    disabled={exportComplete || !isAdmin}
                                    onClick={exportDraftedPlayers}
                                >
                                    Export Drafted Players
                                </button>
                            </div>
                        )}

                        <div className="col-auto px-4">
                            <p>Recently Drafted Player</p>
                            <p>{recentlyDraftedPlayer}</p>
                        </div>

                        <div className="col-auto">
                            Time Left: {Math.floor(timeLeft / 60)}:
                            {('0' + (timeLeft % 60)).slice(-2)}
                        </div>
                        <div className="col-auto">
                            <h6>Help</h6>
                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target="#helpModal"
                            >
                                <i
                                    className={`bi bi-info-circle ${
                                        viewMode === 'dark' ? 'text-light' : ''
                                    }`}
                                />
                            </button>
                        </div>
                        {isAdmin && (
                            <>
                                <div className="col-auto px-4">
                                    {isPaused ? (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={StartTimer}
                                        >
                                            Start
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn btn-outline-warning"
                                            onClick={PauseTimer}
                                        >
                                            Pause
                                        </button>
                                    )}
                                    {isPaused && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger ms-1"
                                            onClick={ResetTimer}
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                                <div className="col-auto px-4">
                                    <h6>War Room Selection</h6>
                                    <BBATeamDropdown
                                        team={userWarRoom}
                                        list={nbaTeams}
                                        currentUser={currentUser}
                                        selectTeam={adminSelectTeam}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="row mt-2">
                        <div className="draft-pick-container">
                            {currentDraftPicks.map((x, idx) => {
                                const TeamLogo = getLogo(
                                    SimNBA,
                                    x.TeamID,
                                    currentUser.IsRetro
                                );

                                return !isMobile ? (
                                    <div
                                        className={`draft-card card mt-1 mb-2 p-1 ${
                                            x.SelectedPlayerID > 0 &&
                                            'border-success'
                                        } ${
                                            currentDraftPick &&
                                            currentDraftPick.ID === x.ID &&
                                            'border-danger'
                                        }  ${
                                            nextDraftPick &&
                                            nextDraftPick.ID === x.ID &&
                                            'border-warning'
                                        }`}
                                    >
                                        <div className="row g-0">
                                            <div className="col-1">
                                                <strong className="draft-number">
                                                    {x.DraftNumber}
                                                </strong>
                                            </div>
                                            <div className="col-3">
                                                <img
                                                    className="draft-card-icon"
                                                    src={TeamLogo}
                                                />
                                            </div>
                                            <div className="col-8">
                                                <div className="card-body">
                                                    <div className="draft-pick-text">
                                                        {x.Team}
                                                    </div>
                                                    {x.SelectedPlayerID !==
                                                        null &&
                                                        x.SelectedPlayerID >
                                                            0 && (
                                                            <small className="text-small">
                                                                {
                                                                    x.SelectedPlayerPosition
                                                                }{' '}
                                                                {
                                                                    x.SelectedPlayerName
                                                                }
                                                            </small>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div
                                            className={`draft-card-mobile card mt-1 mb-1 p-1 ${
                                                x.SelectedPlayerID > 0 &&
                                                'border-success'
                                            } ${
                                                currentDraftPick &&
                                                currentDraftPick.ID === x.ID &&
                                                'border-danger'
                                            }  ${
                                                nextDraftPick &&
                                                nextDraftPick.ID === x.ID &&
                                                'border-warning'
                                            }`}
                                        >
                                            <div className="row">
                                                <div className="col-3">
                                                    <strong className="draft-number me-1">
                                                        {x.DraftNumber}
                                                    </strong>
                                                    <img
                                                        className="image-standings-logo"
                                                        src={TeamLogo}
                                                    />
                                                </div>
                                                <div className="col-9">
                                                    <div className="justify-content-start text-start">
                                                        <label className="draft-pick-text-mobile text-start">
                                                            {x.Team}
                                                            {x.SelectedPlayerID !==
                                                                null &&
                                                                x.SelectedPlayerID >
                                                                    0 && (
                                                                    <>
                                                                        {' | '}
                                                                        {
                                                                            x.SelectedPlayerPosition
                                                                        }{' '}
                                                                        {
                                                                            x.SelectedPlayerName
                                                                        }
                                                                    </>
                                                                )}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                );
                            })}
                        </div>
                    </div>
                    <NBADraftHelpModal isNBA />
                    <ScoutingModal
                        profile={modalDraftee}
                        retro={currentUser.IsRetro}
                        wr={warRoom}
                    />
                    <div className="row mt-3">
                        <ul className="nav nav-tabs">
                            <WarRoomTab
                                activeView={activeView}
                                warRoomType="War Room"
                                setActiveView={setActiveView}
                            />
                            <WarRoomTab
                                activeView={activeView}
                                warRoomType="Draft List"
                                setActiveView={setActiveView}
                            />
                            <WarRoomTab
                                activeView={activeView}
                                warRoomType="Scouting Board"
                                setActiveView={setActiveView}
                            />
                            <li className="nav-item">
                                <button
                                    type="button"
                                    className="nav-link"
                                    role="tab"
                                    disabled
                                >
                                    Total Points: {warRoom.ScoutingPoints}
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    type="button"
                                    className="nav-link"
                                    role="tab"
                                    disabled
                                >
                                    Spent Points: {warRoom.SpentPoints}
                                </button>
                            </li>
                        </ul>
                    </div>
                    {activeView === 'War Room' && (
                        <>
                            <div className="row mt-2 draft-war-room">
                                <div className="row mb-2 d-flex">
                                    <h4 className="text-start">
                                        {warRoom.Team} War Room
                                    </h4>
                                </div>
                                <div className="row">
                                    <div className="col-auto">
                                        <h5>Draft Picks:</h5>
                                    </div>
                                    {warRoom.DraftPicks.length > 0 &&
                                        warRoom.DraftPicks.map((x) => (
                                            <WarRoomPick pick={x} />
                                        ))}
                                </div>
                            </div>
                        </>
                    )}
                    {activeView === 'Draft List' && (
                        <>
                            <div className="row mt-2 mb-1">
                                <div className="col-md-auto">
                                    <h6 className="text-start align-middle">
                                        Position
                                    </h6>
                                    <Select
                                        options={positions}
                                        isMulti={true}
                                        className="basic-multi-select btn-dropdown-width-team z-index-6"
                                        classNamePrefix="select"
                                        onChange={ChangePositions}
                                    />
                                </div>
                                <div className="col-md-auto">
                                    <h6 className="text-start align-middle">
                                        Archetype
                                    </h6>
                                    <Select
                                        options={archetypes}
                                        isMulti={true}
                                        className="basic-multi-select btn-dropdown-width-team z-index-6"
                                        classNamePrefix="select"
                                        onChange={ChangeArchetypes}
                                    />
                                </div>
                                <div className="col-md-auto">
                                    <h6 className="text-start align-middle">
                                        School
                                    </h6>
                                    <Select
                                        options={colleges}
                                        isMulti={true}
                                        className="basic-multi-select btn-dropdown-width-team z-index-6"
                                        classNamePrefix="select"
                                        onChange={ChangeColleges}
                                    />
                                </div>
                            </div>
                            <div
                                className={`${
                                    !isMobile
                                        ? 'row px-2 nfl-draft-draftee-box'
                                        : ''
                                }`}
                            >
                                <InfiniteScroll
                                    dataLength={viewablePlayers.length}
                                    next={loadMoreRecords}
                                    hasMore={
                                        viewablePlayers.length <
                                        allDraftablePlayers.length
                                    }
                                    height={282}
                                    scrollThreshold={0.7}
                                >
                                    {!isMobile ? (
                                        <>
                                            <table
                                                className={`${tableHoverClass} table-responsive`}
                                            >
                                                <thead
                                                    style={{
                                                        position: 'sticky',
                                                        top: 0,
                                                        backgroundColor:
                                                            viewMode === 'dark'
                                                                ? '#202020'
                                                                : 'white',
                                                        zIndex: 3,
                                                        fontSize: '1.5vh'
                                                    }}
                                                >
                                                    <tr>
                                                        <th scope="col">
                                                            Rank
                                                        </th>
                                                        <th scope="col">
                                                            Name
                                                        </th>
                                                        <th scope="col">Age</th>
                                                        <th scope="col">Ht.</th>
                                                        <th scope="col">
                                                            College
                                                        </th>
                                                        <th scope="col">
                                                            Region
                                                        </th>
                                                        <th scope="col">Ovr</th>
                                                        <th scope="col">
                                                            Scout
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {viewablePlayers.map(
                                                        (x, idx) => (
                                                            <NBADrafteeRow
                                                                player={x}
                                                                ts={
                                                                    cbb_Timestamp
                                                                }
                                                                map={scoutMap}
                                                                draftMap={
                                                                    draftMap
                                                                }
                                                                add={
                                                                    addPlayerToScoutingBoard
                                                                }
                                                                idx={idx}
                                                                theme={viewMode}
                                                            />
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </>
                                    ) : (
                                        <>
                                            {viewablePlayers.map((x, idx) => (
                                                <NBADrafteeRow
                                                    player={x}
                                                    ts={cbb_Timestamp}
                                                    map={scoutMap}
                                                    draftMap={draftMap}
                                                    add={
                                                        addPlayerToScoutingBoard
                                                    }
                                                    idx={idx}
                                                    theme={viewMode}
                                                    isMobile={true}
                                                />
                                            ))}
                                        </>
                                    )}
                                </InfiniteScroll>
                            </div>
                        </>
                    )}
                    {activeView === 'Scouting Board' && (
                        <>
                            {!isMobile ? (
                                <div className="row mt-2 nfl-draft-scout-box">
                                    <table
                                        className={`${tableHoverClass} table-responsive`}
                                    >
                                        <thead
                                            style={{
                                                position: 'sticky',
                                                top: 0,
                                                backgroundColor:
                                                    viewMode === 'dark'
                                                        ? '#202020'
                                                        : 'white',
                                                zIndex: 3,
                                                fontSize: '1.5vh'
                                            }}
                                        >
                                            <tr>
                                                <th scope="col">Name</th>
                                                <th scope="col">Age</th>
                                                <th scope="col">Height</th>
                                                <th scope="col">College</th>
                                                <th scope="col">Overall</th>
                                                <th scope="col">Finishing</th>
                                                <th scope="col">2pt.</th>
                                                <th scope="col">3pt.</th>
                                                <th scope="col">FT</th>
                                                <th scope="col">Ballwork</th>
                                                <th scope="col">Rebounding</th>
                                                <th scope="col">
                                                    Int. Defense
                                                </th>
                                                <th scope="col">
                                                    Per. Defense
                                                </th>
                                                <th scope="col">Pot.</th>
                                                <th scope="col">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="overflow-auto">
                                            {warRoom &&
                                                warRoom.ScoutProfiles.length >
                                                    0 &&
                                                warRoom.ScoutProfiles.map(
                                                    (x, idx) => (
                                                        <NBAScoutPlayerRow
                                                            key={x.ID}
                                                            profile={x}
                                                            idx={idx}
                                                            ts={cbb_Timestamp}
                                                            viewMode={viewMode}
                                                            currentDraftPick={
                                                                currentDraftPick
                                                            }
                                                            map={draftMap}
                                                            draft={draftPlayer}
                                                            remove={
                                                                removePlayerFromBoard
                                                            }
                                                            wr={warRoom}
                                                            reveal={
                                                                revealAttribute
                                                            }
                                                            setDraftee={
                                                                setModalDraftee
                                                            }
                                                        />
                                                    )
                                                )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <>
                                    <div className="row mt-2 nfl-draft-mobile-box">
                                        {warRoom &&
                                            warRoom.ScoutProfiles.length > 0 &&
                                            warRoom.ScoutProfiles.map(
                                                (x, idx) => (
                                                    <NBAScoutPlayerRow
                                                        key={x.ID}
                                                        profile={x}
                                                        idx={idx}
                                                        ts={cbb_Timestamp}
                                                        viewMode={viewMode}
                                                        currentDraftPick={
                                                            currentDraftPick
                                                        }
                                                        map={draftMap}
                                                        draft={draftPlayer}
                                                        remove={
                                                            removePlayerFromBoard
                                                        }
                                                        wr={warRoom}
                                                        reveal={revealAttribute}
                                                        setDraftee={
                                                            setModalDraftee
                                                        }
                                                        isMobile={true}
                                                    />
                                                )
                                            )}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};
const mapStateToProps = ({
    user: { currentUser },
    nbaTeam: { nbaTeam },
    timestamp: { cbb_Timestamp },
    viewMode: { viewMode }
}) => ({
    currentUser,
    nbaTeam,
    cbb_Timestamp,
    viewMode
});

export default connect(mapStateToProps)(NBADraftPage);
