import React, { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { useMediaQuery } from 'react-responsive';
import { Timestamp } from 'firebase/firestore';
import { connect } from 'react-redux';
import FBADraftService from '../../../_Services/simFBA/FBADraftService';
import {
    useFireStoreCollection,
    useFirestore
} from '../../../Firebase/firebase';
import { MapObjOptions } from '../../../_Utility/filterHelper';
import {
    ArchetypesListForFA,
    FBPositionList,
    SimNFL
} from '../../../Constants/CommonConstants';
import { GetTableHoverClass } from '../../../Constants/CSSClassHelper';
import {
    GetCurrentDraftPick,
    GetCurrentDraftPickIdx,
    GetPickTeamLogo,
    GetRecentlyDraftedPlayer,
    GetViewablePlayersList,
    GetPicksByCurrentRound,
    GetTradeWarRoom,
    useDraftMapNFL
} from '../../../_Hooks/DraftHooks';
import {
    GetPauseTimer,
    GetResetTimer,
    GetStartTimerNFL
} from '../../../_Utility/DraftHelper';
import { Spinner } from '../../_Common/Spinner';
import { NFLTeamDropdown } from '../../_Common/Dropdown';
import {
    DesktopDraftPick,
    DrafteeRow,
    MobileDraftPick,
    ScoutPlayerRow,
    WarRoomPick,
    WarRoomTab
} from '../../_Common/DraftComponents';
import {
    NBADraftHelpModal,
    ScoutingModal
} from '../../BBA/NBA/Draft Room/NBADraftModals';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getLogo } from '../../../Constants/getLogo';
import FBATradeService from '../../../_Services/simFBA/FBATradeService';
import { TeamDropdown } from '../../_Common/TeamDropdown';
import { GenerateUniqueID } from '../../../_Utility/utilHelper';
import { ReceivedProposalsModal } from '../TradeBlock/ReceivedProposalsModal';
import { TradeProposalModal } from '../TradeBlock/TradeProposalModal';
import { NFLDraftTradeModal } from './NFLDraftModals';

const NFLDraftPage = ({ currentUser, nflTeam, cfb_Timestamp, viewMode }) => {
    const _draftService = new FBADraftService();
    const _tradeService = new FBATradeService();
    const [data, updateData] = useFirestore(
        'nfldraftstate',
        'Mwwhz87HR14DNHy99cmh'
    );
    const [approvedTrades, updateApprovedTrades] = useFirestore(
        'nfldraftstate',
        'UCNjOhC0hbqZhl1BWBy6'
    );
    const [tradeCollection, setTradeCollection] =
        useFireStoreCollection('nflwarrooms');

    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [endAt, setEndTime] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(300);
    const [warRoom, setWarRoom] = useState(null);
    const [userWarRoom, setUserWarRoom] = useState(null);
    const [scoutMap, setScoutMap] = useState({});
    const [nflTeams, setNFLTeams] = useState([]);
    const [draftPickList, setDraftPickList] = useState([]);
    const positions = MapObjOptions(FBPositionList);
    const archetypes = MapObjOptions(ArchetypesListForFA);
    const [colleges, setColleges] = useState([]);
    const [selectedPositions, setPositions] = useState('');
    const [selectedArchetypes, setArchetypes] = useState('');
    const [selectedColleges, setSelectedColleges] = useState('');
    const [mobileView, setMobileView] = useState('DRAFT');
    const [viewWidth, setViewWidth] = useState(window.innerWidth);
    const [modalDraftee, setModalDraftee] = useState(null);
    const [activeView, setActiveView] = useState('War Room');
    const tableHoverClass = GetTableHoverClass(viewMode);
    const [allDraftablePlayers, setAllDraftablePlayers] = useState([]);
    const [userPlayers, setUserPlayers] = useState([]);
    const [userPicks, setUserPicks] = useState([]);
    const [tradePartner, setTradePartner] = useState(null);
    const [tradablePlayers, setTradablePlayers] = useState([]);
    const [tradablePicks, setTradablePicks] = useState([]);
    const [canPropose, setCanPropose] = useState(false);
    const [viewCount, setViewCount] = useState(100);
    const isMobile = useMediaQuery({ query: `(max-width:851px)` });
    const {
        allDraftPicks,
        currentPick,
        currentRound,
        nextPick,
        recentlyDraftedPlayerID,
        draftingTeamID,
        exportComplete,
        endTime
    } = data || {};
    console.log("If you're reading this, you shouldn't be looking here.");
    const { approvedRequests } = approvedTrades || {};

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

    useEffect(() => {
        if (currentUser && !warRoom) {
            const adminStatus = currentUser.roleID === 'Admin';
            setIsAdmin(() => adminStatus);
            if (!warRoom) {
                GetDraftPageData(currentUser.NFLTeamID);
            }
        }
    }, [currentUser, warRoom]);

    useEffect(() => {
        if (!data?.endTime) return;
        setEndTime(data.endTime.toDate());
        setIsPaused(data.isPaused);
        setTimeLeft(data.seconds);
    }, [data]);

    // For mobile
    useEffect(() => {
        if (!viewWidth) {
            setViewWidth(window.innerWidth);
        }
    }, [viewWidth]);

    const currentDraftPicks = GetPicksByCurrentRound(
        allDraftPicks,
        currentRound
    );

    const recentlyDraftedPlayer = GetRecentlyDraftedPlayer(
        allDraftablePlayers,
        recentlyDraftedPlayerID
    );
    const draftMap = useDraftMapNFL(allDraftPicks);
    const currentDraftPickIdx = GetCurrentDraftPickIdx(
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
    const nextDraftPickIdx = GetCurrentDraftPickIdx(
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
        SimNFL,
        currentDraftPick,
        currentUser.IsRetro
    );
    const nextPickTeamLogo = GetPickTeamLogo(
        SimNFL,
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

    const tradeWarRoom = GetTradeWarRoom(warRoom, tradeCollection);

    const StartTimer = () => {
        GetStartTimerNFL(data, currentPick, timeLeft, isPaused, updateData);
    };

    const PauseTimer = () => {
        GetPauseTimer(data, timeLeft, updateData);
    };
    const ResetTimer = () => {
        GetResetTimer(data, updateData);
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
                name: college.TeamName,
                abbr: college.TeamAbbr
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
        // setDraftPickList(() => res.AllDraftPicks);
        setWarRoom(() => res.WarRoom);
        setAllDraftablePlayers(() => res.DraftablePlayers);
        if (res.WarRoom.TeamID === currentUser.NFLTeamID) {
            setUserWarRoom(() => res.WarRoom);
        }
        if (nflTeams.length === 0) {
            setNFLTeams(() => res.NFLTeams);
        }
        setScoutMap(() => scoutingMap);
        await GetTradeBlockData(id);
        setIsLoading(() => false);
    };

    const GetTradeBlockData = async (TeamID) => {
        const res = await _tradeService.GetTradeBlockDataByTeamID(TeamID);
        setTradablePlayers(() => [...res.TradablePlayers]);
        setTradablePicks(() => [...res.DraftPicks]);
        const proposable =
            res.Team.ID !== currentUser.NFLTeamID &&
            (currentUser.NFLRole === 'Owner' ||
                currentUser.NFLRole === 'Manager');
        if (userPlayers.length === 0 && userPicks.length === 0) {
            setUserPlayers(() => [...res.TradablePlayers]);
            setUserPicks(() => [...res.DraftPicks]);
        }
        setCanPropose(() => proposable);
    };

    const adminSelectTeam = async (team) => {
        if (!isAdmin) {
            alert('Sorry, but this is something only Tuscan can do for now.');
            return;
        }
        setIsLoading(() => true);
        await GetDraftPageData(team.ID);
    };

    const selectTradePartner = async (team) => {
        setTradePartner(team);
        await GetTradeBlockData(team.ID);
    };

    const exportDraftedPlayers = async () => {
        if (exportComplete) {
            return;
        }
        const draftPickMap = { ...allDraftPicks };
        const draftpicks = [];
        for (let i = 1; i < 8; i++) {
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
            draftPicks[7][draftPicks[7].length - 1].DraftNumber;
        const finalPick = currentPick === finalDraftPick;
        if (finalPick) {
            currRound = 1;
        }
        const newData = {
            ...data,
            currentPick: theNextPick,
            nextPick: theNextPick + 1,
            currentRound: currRound,
            recentlyDraftedPlayerID: player.ID,
            allDraftPicks: draftPicks,
            isPaused: true,
            draftingTeam: nextDraftPick.Team,
            draftingTeamID: nextDraftPick.TeamID
        };
        updateData(newData);
        setTimeout(() => {
            let seconds = 0;
            if (currentPick < 33) {
                seconds = 300;
            } else if (currentPick < 131) {
                seconds = 180;
            } else {
                seconds = 120;
            }
            const endTime = Timestamp.fromDate(
                new Date(Date.now() + seconds * 1000)
            );
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
            const keyCode = `${profile.PlayerID}`;
            const scoutingMap = { ...scoutMap };
            scoutingMap[keyCode] = false;
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
            if (attr === 'ShowAttribute1') {
                wr.ScoutProfiles[idx].ShowAttribute1 = true;
            } else if (attr === 'ShowAttribute2') {
                wr.ScoutProfiles[idx].ShowAttribute2 = true;
            } else if (attr === 'ShowAttribute3') {
                wr.ScoutProfiles[idx].ShowAttribute3 = true;
            } else if (attr === 'ShowAttribute4') {
                wr.ScoutProfiles[idx].ShowAttribute4 = true;
            } else if (attr === 'ShowAttribute5') {
                wr.ScoutProfiles[idx].ShowAttribute5 = true;
            } else if (attr === 'ShowAttribute6') {
                wr.ScoutProfiles[idx].ShowAttribute6 = true;
            } else if (attr === 'ShowAttribute7') {
                wr.ScoutProfiles[idx].ShowAttribute7 = true;
            } else if (attr === 'ShowAttribute8') {
                wr.ScoutProfiles[idx].ShowAttribute8 = true;
            } else if (attr === 'ShowPotential') {
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

    // Table Functions
    const loadRecords = () => {
        setViewCount((x) => x + 100);
    };

    const loadMoreRecords = () => {
        setTimeout(() => loadRecords(), 500);
    };

    // Click Functions
    const ChangePositions = (options) => {
        const opts = [...options.map((x) => x.value)];
        setPositions(opts);
    };

    const ChangeArchetypes = (options) => {
        const opts = [...options.map((x) => x.value)];
        setArchetypes(opts);
    };

    const ChangeColleges = (options) => {
        const opts = [...options.map((x) => x.value)];
        setSelectedColleges(opts);
    };

    // Trade Functions
    const ProposeTrade = (dto, modalDTO) => {
        const cols = [...tradeCollection];
        const newID = GenerateUniqueID();
        const newDTO = { ...modalDTO, ID: newID };
        const tradeRoom = { ...tradeWarRoom };

        const sentRequests = tradeRoom.sentRequests
            ? tradeRoom.sentRequests
            : [];
        let sentProposals = [...sentRequests];
        if (!sentProposals || sentProposals.length === 0) {
            sentProposals = [newDTO];
        } else {
            sentProposals.push(newDTO);
        }
        tradeRoom.sentRequests = sentProposals;
        const collectionIdx = cols.findIndex((x) => x.id === tradeRoom.id);
        const receipientWarRoomIdx = cols.findIndex(
            (x) => x.id === newDTO.RecepientTeam
        );
        if (collectionIdx > -1 && receipientWarRoomIdx > -1) {
            cols[collectionIdx] = tradeRoom;
            cols[receipientWarRoomIdx].requests.push(newDTO);
            setTradeCollection(
                cols[receipientWarRoomIdx].id,
                cols[receipientWarRoomIdx]
            );
            setTradeCollection(tradeRoom.id, cols[collectionIdx]);
        }
    };

    const AcceptTrade = (item) => {
        const id = item.ID;
        const cols = [...tradeCollection];
        const sendingTeamIdx = cols.findIndex((x) => x.id === item.NFLTeam);
        const receivingTeamIdx = cols.findIndex(
            (x) => x.id === item.RecepientTeam
        );

        if (sendingTeamIdx > -1 && receivingTeamIdx > -1) {
            const sendingTeam = cols[sendingTeamIdx];
            const receivingTeam = cols[receivingTeamIdx];
            // Filter out trade
            let sentRequests = sendingTeam.sentRequests;
            if (!sentRequests) sentRequests = [];
            const filteredOutSentRequests = sentRequests.filter(
                (x) => x.ID !== id
            );
            sendingTeam.sentRequests = filteredOutSentRequests;
            cols[sendingTeamIdx] = sendingTeam;

            // Receiving Team
            const filteredOutPartnerRequests = receivingTeam.requests.filter(
                (x) => x.ID !== id
            );
            receivingTeam.requests = filteredOutPartnerRequests;
            cols[receivingTeamIdx] = receivingTeam;

            // Update Admin State
            const adminTradeQueue = { ...approvedTrades };
            adminTradeQueue.approvedRequests.push(item);
            updateApprovedTrades(adminTradeQueue);
            setTradeCollection(
                cols[receivingTeamIdx].id,
                cols[receivingTeamIdx]
            );
            setTradeCollection(cols[sendingTeamIdx].id, cols[sendingTeamIdx]);
        }
    };

    const RejectTrade = (item) => {
        const id = item.ID;
        const cols = [...tradeCollection];
        const sendingTeamIdx = cols.findIndex((x) => x.id === item.NFLTeam);
        const recepientTeamIdx = cols.findIndex(
            (x) => x.id === item.RecepientTeam
        );

        if (sendingTeamIdx > -1 && recepientTeamIdx > -1) {
            // Filter out trade
            const sendingTeam = cols[sendingTeamIdx];
            const receivingTeam = cols[recepientTeamIdx];
            let sendingTeamSentRequests = sendingTeam.sentRequests;
            if (sendingTeamSentRequests) {
                sendingTeamSentRequests = sendingTeamSentRequests.filter(
                    (x) => x.ID !== id
                );
                sendingTeam.sentRequests = sendingTeamSentRequests;
            }
            cols[sendingTeamIdx] = sendingTeam;
            receivingTeam.requests = receivingTeam.requests.filter(
                (x) => x.ID !== id
            );
            cols[recepientTeamIdx] = receivingTeam;

            setTradeCollection(
                cols[recepientTeamIdx].id,
                cols[recepientTeamIdx]
            );
            setTradeCollection(cols[sendingTeamIdx].id, cols[sendingTeamIdx]);
        }
    };

    const VetoTrade = (id) => {
        const adminTradeQueue = [...approvedRequests];
        const filteredQueue = adminTradeQueue.filter((x) => x.ID !== id);
        const apt = { ...approvedTrades };
        apt.approvedRequests = filteredQueue;
        updateApprovedTrades(apt);
    };

    const ProcessTrade = async (id) => {
        // Will need to send the entire object to the SimSN API to process the trade from the backend.
        // Some things to note: The Draft Picks section will likely remain static unless the teams reload on the page.
        // That is unless I make the draft pick list in the war room derived from the API call itself
        const adminTradeQueue = [...approvedRequests];
        const itemIdx = adminTradeQueue.findIndex((x) => x.ID === id);
        if (itemIdx < 0) {
            return;
        }
        const item = adminTradeQueue[itemIdx];

        const dto = {
            NFLTeamID: item.NFLTeamID,
            NFLTeam: item.NFLTeam,
            RecepientTeamID: item.RecepientTeamID,
            RecepientTeam: item.RecepientTeam,
            IsTradeAccepted: true,
            IsTradeRejected: false,
            IsSynced: false,
            NFLTeamTradeOptions: item.NFLTeamTradeOptions,
            RecepientTeamTradeOptions: item.RecepientTeamTradeOptions
        };
        // 1. SEND to API
        // Update Firebase
        const res = _tradeService.ProcessDraftTrade(dto);
        // 2. Swap the draft picks, don't worry about players
        const teamTradeDPs = item.NFLTeamTradeOptions.filter(
            (x) => x.NFLDraftPickID > 0
        );

        const recTradeDPs = item.RecepientTeamTradeOptions.filter(
            (x) => x.NFLDraftPickID > 0
        );

        // Sent Team Options
        const swapMapSent = {};
        // Receiving Team Options
        const swapMapRec = {};

        for (let i = 0; i < teamTradeDPs.length; i++) {
            const dpObj = teamTradeDPs[i];
            if (dpObj.NFLDraftPickID > 0) {
                swapMapSent[dpObj.NFLDraftPickID] = true;
            }
        }

        for (let i = 0; i < recTradeDPs.length; i++) {
            const dpObj = recTradeDPs[i];
            if (dpObj.NFLDraftPickID > 0) {
                swapMapRec[dpObj.NFLDraftPickID] = true;
            }
        }

        const allDPs = { ...allDraftPicks };
        // 3. Place updated draft picks into map
        // 4. Iterate over draft pick list

        for (let i = 1; i < 8; i++) {
            for (let j = 0; j < allDPs[i].length; j++) {
                const pick = allDPs[i][j];
                if (swapMapSent[pick.ID]) {
                    pick.PreviousTeamID = pick.TeamID;
                    pick.PreviousTeam = pick.Team;
                    pick.TeamID = item.RecepientTeamID;
                    pick.Team = item.RecepientTeam;
                } else if (swapMapRec[pick.ID]) {
                    pick.PreviousTeamID = pick.TeamID;
                    pick.PreviousTeam = pick.Team;
                    pick.TeamID = item.NFLTeamID;
                    pick.Team = item.NFLTeam;
                }
            }
        }

        // 5. If a draft pick matches with an item in the map, update the list with the new info
        // 6. Update Draft State
        const newData = {
            ...data,
            allDraftPicks: allDPs
        };
        updateData(newData);
        // 7. Filter out item from Admin Trades
        // 8. Save Admin State
        const filteredQueue = adminTradeQueue.filter((x) => x.ID !== id);
        const apt = { ...approvedTrades };
        apt.approvedRequests = filteredQueue;
        updateApprovedTrades(apt);
    };

    return (
        <div className="container-fluid mt-3">
            {isLoading ? (
                <Spinner />
            ) : (
                <>
                    <div className="row draft-room-header">
                        <div className="col-2 justify-content-start ms-end">
                            <h3>NFL Draft Room</h3>
                        </div>

                        {currentDraftPickIdx > -1 && (
                            <>
                                <div className="col-auto px-4">
                                    <p>Current Round: {currentRound}</p>
                                    <p>Current Pick: {currentPick}</p>
                                </div>
                                <div className="col-auto px-4">
                                    Team Drafting:{' '}
                                    <img
                                        src={currentPickTeamLogo}
                                        className="draft-card-icon"
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
                                    className="draft-card-icon"
                                    alt="Next Team Logo"
                                />
                            </div>
                        )}
                        {!exportComplete && (
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
                                            className="btn btn-outline-warning ms-1"
                                            onClick={ResetTimer}
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                                <div className="col-auto">
                                    <h6>Manage Trades</h6>
                                    <button
                                        type="button"
                                        className={`btn ${
                                            approvedRequests &&
                                            approvedRequests.length > 0
                                                ? 'btn-danger'
                                                : 'btn-outline-danger'
                                        }`}
                                        data-bs-toggle="modal"
                                        data-bs-target="#adminTradeModal"
                                    >
                                        <i className="bi bi-arrow-down-up" />
                                    </button>
                                </div>
                                <div className="col-auto px-4">
                                    <h6>War Room Selection</h6>
                                    <NFLTeamDropdown
                                        team={userWarRoom}
                                        list={nflTeams}
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
                                    SimNFL,
                                    x.TeamID,
                                    currentUser.IsRetro
                                );

                                return !isMobile ? (
                                    <DesktopDraftPick
                                        currentDraftPick={currentDraftPick}
                                        nextDraftPick={nextDraftPick}
                                        pick={x}
                                        logo={TeamLogo}
                                    />
                                ) : (
                                    <MobileDraftPick
                                        currentDraftPick={currentDraftPick}
                                        nextDraftPick={nextDraftPick}
                                        pick={x}
                                        logo={TeamLogo}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    <NBADraftHelpModal />
                    <ScoutingModal
                        profile={modalDraftee}
                        retro={currentUser.IsRetro}
                        wr={warRoom}
                        reveal={revealAttribute}
                        isNFL
                    />

                    {approvedRequests && (
                        <NFLDraftTradeModal
                            approvedTrades={approvedRequests}
                            process={ProcessTrade}
                            veto={VetoTrade}
                        />
                    )}
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
                            {warRoom &&
                                nflTeam &&
                                tradePartner &&
                                cfb_Timestamp && (
                                    <TradeProposalModal
                                        theme={viewMode}
                                        ts={cfb_Timestamp}
                                        userTeam={nflTeam}
                                        currentTeam={tradePartner}
                                        tradablePlayers={tradablePlayers}
                                        tradablePicks={tradablePicks}
                                        userPlayers={userPlayers}
                                        userPicks={userPicks}
                                        Propose={ProposeTrade}
                                    />
                                )}
                            {tradeWarRoom && nflTeam && (
                                <ReceivedProposalsModal
                                    sent={tradeWarRoom.sentRequests}
                                    received={tradeWarRoom.requests}
                                    theme={viewMode}
                                    accept={AcceptTrade}
                                    reject={RejectTrade}
                                    cancel={RejectTrade}
                                />
                            )}
                            <div className="draft-war-room">
                                <div className="row">
                                    <div className="col-auto text-start">
                                        <h4>{warRoom.Team} War Room</h4>
                                    </div>
                                    <div className="col-auto">
                                        <h5>
                                            Total Points:{' '}
                                            {warRoom.ScoutingPoints}
                                        </h5>
                                    </div>
                                    <div className="col-auto">
                                        <h5>
                                            Spent Points: {warRoom.SpentPoints}
                                        </h5>
                                    </div>
                                    {tradeWarRoom && (
                                        <div className="col-auto ms-2">
                                            {!isMobile && (
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#receivedProposalsModal"
                                                >
                                                    <i
                                                        className={`bi bi-bell-fill ${
                                                            tradeWarRoom
                                                                .requests
                                                                .length > 0
                                                                ? 'text-danger'
                                                                : ''
                                                        }`}
                                                    />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {warRoom.DraftPicks.length > 0 && (
                                    <div className="row mt-2 d-flex">
                                        <h5 className="text-start">
                                            Draft Picks:
                                        </h5>
                                        {warRoom.DraftPicks.map((x) => (
                                            <WarRoomPick pick={x} />
                                        ))}
                                    </div>
                                )}
                                {tradeWarRoom && (
                                    <div className="row mt-2 d-flex text-start">
                                        <h6>{tradeWarRoom.id} Trade Room</h6>
                                        <div className="row">
                                            <div className="col-2 d-flex">
                                                <TeamDropdown
                                                    teams={nflTeams}
                                                    currentTeam={nflTeam}
                                                    clickUserTeam={
                                                        selectTradePartner
                                                    }
                                                    click={selectTradePartner}
                                                    currentUser={currentUser}
                                                    isNFL
                                                />
                                                <button
                                                    type="button"
                                                    className={`btn ${
                                                        canPropose
                                                            ? 'btn-outline-success'
                                                            : 'btn-outline-secondary'
                                                    }`}
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#tradeProposalModal"
                                                    disabled={
                                                        !canPropose ||
                                                        tradeWarRoom.ID ===
                                                            draftingTeamID ||
                                                        !cfb_Timestamp.IsDraftTime
                                                    }
                                                >
                                                    Propose Trade
                                                </button>
                                            </div>
                                            <div className="col-10">
                                                {tradePartner && (
                                                    <div className="row">
                                                        <h5 className="text-start">
                                                            {
                                                                tradePartner.TeamName
                                                            }{' '}
                                                            Draft Picks:
                                                        </h5>
                                                        {tradablePicks.length >
                                                            0 &&
                                                            tradablePicks.map(
                                                                (x) => (
                                                                    <WarRoomPick
                                                                        pick={x}
                                                                    />
                                                                )
                                                            )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                                    <th scope="col">Rank</th>
                                                    <th scope="col">
                                                        Position
                                                    </th>
                                                    <th scope="col">Name</th>
                                                    <th scope="col">
                                                        Archetype
                                                    </th>
                                                    <th scope="col">Age</th>
                                                    <th scope="col">Height</th>
                                                    <th scope="col">Weight</th>
                                                    <th scope="col">College</th>
                                                    <th scope="col">
                                                        Hometown
                                                    </th>
                                                    <th scope="col">Ovr</th>
                                                    <th scope="col">Scout</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {viewablePlayers.map(
                                                    (x, idx) => (
                                                        <DrafteeRow
                                                            player={x}
                                                            ts={cfb_Timestamp}
                                                            map={scoutMap}
                                                            draftMap={draftMap}
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
                                    ) : (
                                        <>
                                            {viewablePlayers.map((x, idx) => (
                                                <DrafteeRow
                                                    player={x}
                                                    map={scoutMap}
                                                    draftMap={draftMap}
                                                    add={
                                                        addPlayerToScoutingBoard
                                                    }
                                                    idx={idx}
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
                                    {warRoom &&
                                        warRoom.ScoutProfiles.length > 0 &&
                                        warRoom.ScoutProfiles.map((x, idx) => (
                                            <ScoutPlayerRow
                                                key={x.ID}
                                                profile={x}
                                                playerIdx={idx}
                                                ts={cfb_Timestamp}
                                                viewMode={viewMode}
                                                currentDraftPick={
                                                    currentDraftPick
                                                }
                                                draftedPlayerMap={draftMap}
                                                draft={draftPlayer}
                                                remove={removePlayerFromBoard}
                                                wr={warRoom}
                                                reveal={revealAttribute}
                                                setDraftee={setModalDraftee}
                                            />
                                        ))}
                                </div>
                            ) : (
                                <>
                                    <div className="row mt-2 nfl-draft-mobile-box">
                                        {warRoom &&
                                            warRoom.ScoutProfiles.length > 0 &&
                                            warRoom.ScoutProfiles.map(
                                                (x, idx) => (
                                                    <ScoutPlayerRow
                                                        key={x.ID}
                                                        profile={x}
                                                        playerIdx={idx}
                                                        ts={cfb_Timestamp}
                                                        viewMode={viewMode}
                                                        currentDraftPick={
                                                            currentDraftPick
                                                        }
                                                        draftedPlayerMap={
                                                            draftMap
                                                        }
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
    nflTeam: { nflTeam },
    timestamp: { cfb_Timestamp },
    viewMode: { viewMode }
}) => ({
    currentUser,
    nflTeam,
    cfb_Timestamp,
    viewMode
});

export default connect(mapStateToProps)(NFLDraftPage);
