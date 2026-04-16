import React, { useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import toast from 'react-hot-toast';
import { Spinner } from '../_Common/Spinner';
import { connect } from 'react-redux';
import { GPTab } from '../Gameplan/GameplanCommons';
import { PortalService } from '../../_Services/simFBA/FBAPortalService';
import InfiniteScroll from 'react-infinite-scroll-component';
import { TPOverviewMobileRow, TPProfileMobileRow } from './TPMobileRows';
import { TPOverviewRow, TPProfileRow } from './TPDesktopRows';
import {
    ConductSortForCBBOverview,
    GenerateNumberFromRange,
    GenerateUniqueID,
    inconspicuousLink
} from '../../_Utility/utilHelper';
import {
    TPBoardHeader,
    TPOverviewHeader,
    ViewTransferPlayerModal
} from './TransferPortalCommons';
import { MapObjOptions, MapOptions } from '../../_Utility/filterHelper';
import {
    LetterGradesList,
    BBPositionList,
    SimpleLetterGrades,
    StarsList
} from '../../Constants/BBAConstants';
import Select from 'react-select';
import { PromisePlayerModal } from '../_Common/ModalComponents';
import { GetBBallTransferPortalStatements } from '../../Constants/CollusionStatements';
import EasterEggService from '../../_Services/simFBA/EasterEggService';
import { FBPositionList } from '../../Constants/CommonConstants';

const TransferPortal = ({
    isCFB,
    currentUser,
    cbbTeam,
    cfbTeam,
    cfb_Timestamp,
    cbb_Timestamp,
    viewMode
}) => {
    return (
        <>
            <div className="container-fluid mt-3">
                <h3>
                    Interface 1.0's Transfer Portal is officially closed. Please
                    navigate to Interface 2.0 in order to use the transfer
                    portal.
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

    const _portalService = new PortalService();
    const [isLoading, setIsLoading] = useState(true);
    const [teamProfile, setTeamProfile] = useState(null);
    const [portalProfiles, setPortalProfiles] = useState([]);
    const [teamList, setTeamList] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const [teamPromises, setTeamPromises] = useState([]);
    const [activePromisesCount, setActivePromisesCount] = useState(0);
    const [allPlayers, setAllPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [viewablePlayers, setViewablePlayers] = useState([]);
    const [portalMap, setPortalMap] = useState({});
    const [mobileView, setMobileView] = useState('DRAFT');
    const [viewWidth, setViewWidth] = useState(window.innerWidth);
    const [viewCount, setViewCount] = useState(100);
    const isMobile = useMediaQuery({ query: `(max-width:851px)` });
    const [viewPlayer, setViewPlayer] = useState(null);
    const [viewProfile, setViewProfile] = useState(null);
    const [activeView, setActiveView] = useState('Overview');
    const [selectedSchools, setSelectedSchools] = useState('');
    const [selectedPositions, setPositions] = useState('');
    const [selectedOverallGrades, setOverallGrades] = useState('');
    const [selectedPotentialGrades, setPotentialGrades] = useState('');
    const [selectedStars, setStars] = useState('');
    const [count, setCount] = useState(100);
    const [sort, setSort] = useState('Rank');
    const [isAsc, setIsAsc] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const ts = useMemo(() => {
        return isCFB ? cfb_Timestamp : cbb_Timestamp;
    }, [isCFB, cfb_Timestamp, cbb_Timestamp]);
    const positions = isCFB
        ? MapObjOptions(FBPositionList)
        : MapObjOptions(BBPositionList);
    const letterGrades = MapOptions(LetterGradesList);
    const stars = MapOptions(StarsList);

    // For mobile
    useEffect(() => {
        if (!viewWidth) {
            setViewWidth(window.innerWidth);
        }
    }, [viewWidth]);

    useEffect(() => {
        if (currentUser) {
            const id = isCFB ? currentUser.teamId : currentUser.cbb_id;
            GetTransferPortalData(id);
        }
    }, [currentUser]);

    useEffect(() => {
        if (teamPromises.length > 0) {
            let count = 0;
            for (let i = 0; i < teamPromises.length; i++) {
                const prom = teamPromises[i];
                if (prom.IsActive === false) {
                    continue;
                }
                count++;
            }
            setActivePromisesCount(() => count);
        }
    }, [teamPromises]);

    useEffect(() => {
        const fp = filterPlayers(allPlayers);
        if (fp.length > 0) {
            const sp = ConductSortForCBBOverview([...fp], sort, isAsc);
            setFilteredPlayers(() => [...sp]);
            setViewablePlayers(() => [...sp.slice(0, count)]);
        }
    }, [
        selectedOverallGrades,
        selectedPositions,
        selectedPotentialGrades,
        selectedSchools,
        selectedStars,
        sort,
        isAsc
    ]);

    const GetTransferPortalData = async (id) => {
        const res = await _portalService.GetTransferPortalPageData(isCFB, id);
        let board = res.TeamBoard;
        if (board === null || board === undefined) board = [];
        setPortalProfiles(() => board);
        setTeamProfile(() => res.Team);
        const allPlayers = [...res.Players];
        setAllPlayers(() => allPlayers);
        const fp = filterPlayers(allPlayers);
        setFilteredPlayers(() => [...fp]);
        setViewablePlayers(() => [...fp].slice(0, count));
        setTeamPromises(() => res.TeamPromises);
        setIsLoading(() => false);
        const teamList = [...res.TeamList];
        const tl = teamList.map((x) => {
            return { label: isCFB ? x.TeamName : x.Team, value: x.ID };
        });
        const pMap = {};
        for (let i = 0; i < board.length; i++) {
            pMap[res.TeamBoard[i].CollegePlayerID] = true;
        }
        setTeamList(() => tl);
        setAllTeams(() => teamList);
        setPortalMap(() => pMap);
        Validate();
    };

    // Filter
    const filterPlayers = (players) => {
        let fp = [...players];
        if (fp.length > 0) {
            if (selectedPositions.length > 0) {
                fp = fp.filter((x) => selectedPositions.includes(x.Position));
            }
            if (selectedPotentialGrades.length > 0) {
                fp = fp.filter((x) =>
                    selectedPotentialGrades.includes(x.PotentialGrade)
                );
            }
            if (selectedOverallGrades.length > 0) {
                fp = fp.filter((x) =>
                    selectedOverallGrades.includes(x.OverallGrade)
                );
            }
            if (selectedStars.length > 0) {
                fp = fp.filter((x) => selectedStars.includes(x.Stars));
            }
            if (selectedSchools.length > 0) {
                fp = fp.filter((x) =>
                    selectedSchools.includes(x.PreviousTeamID)
                );
            }
        }
        return fp;
    };

    const ChangeSchools = (options) => {
        const opts = [...options.map((x) => x.value)];
        setSelectedSchools(() => opts);
    };

    const ChangePotentialLetterGrades = (options) => {
        const opts = [...options.map((x) => x.value)];
        setPotentialGrades(() => opts);
    };

    const ChangeOverallLetterGrades = (options) => {
        const opts = [...options.map((x) => x.value)];
        setOverallGrades(() => opts);
    };

    const ChangeStars = (options) => {
        const opts = [...options.map((x) => x.value)];
        setStars(() => opts);
    };

    const ChangePositions = (options) => {
        const opts = [...options.map((x) => x.value)];
        setPositions(() => opts);
    };
    // Sort

    const AddPlayerToBoard = async (player) => {
        let newMap = { ...portalMap };
        let tp = { ...teamProfile };
        const key = `${player.PlayerID}`;
        newMap[key] = true;

        // async
        const profileDTO = {
            SeasonID: ts.SeasonID,
            CollegePlayerID: player.PlayerID,
            ProfileID: tp.ID,
            TeamAbbreviation: tp.TeamAbbreviation,
            TotalPoints: 0,
            CurrentWeeksPoints: 0,
            PreviouslySpentPoints: 0,
            SpendingCount: 0,
            RemovedFromBoard: false,
            RolledOnPromise: false,
            LockProfile: false,
            IsSigned: false,
            Recruiter: currentUser.username
        };

        let newProfile = await _portalService.CreatePortalProfile(
            isCFB,
            profileDTO
        );

        if (newProfile) {
            const fullProfile = { ...profileDTO, CollegePlayer: player };
            if (fullProfile.ID === 0) {
                const tempID = GenerateUniqueID();
                fullProfile.ID = tempID;
            }
            const pp = portalProfiles ? [...portalProfiles] : [];
            pp.push(fullProfile);
            setPortalMap(() => newMap);
            setPortalProfiles(() => pp);
            setFilteredPlayers(() => filteredPlayers);
            toast.success(
                `${player.Position} ${player.FirstName} ${player.LastName} has been added to your scouting board.`
            );
        }
    };

    const RemovePlayerFromBoard = async (profile) => {
        const id = profile.ID;
        const res = await _portalService.RemovePortalProfile(isCFB, id);
        const points = profile.CurrentWeeksPoints;
        if (res) {
            const pp = [...portalProfiles].filter((x) => x.ID !== id);
            const newMap = { ...portalMap };
            newMap[`${profile.CollegePlayerID}`] = false;
            setPortalProfiles(() => pp);
            setPortalMap(() => newMap);
            const tp = { ...teamProfile };
            tp.SpentPoints = tp.SpentPoints - points;
            setTeamProfile(() => tp);
            toast.success('Successfully removed player from transfer board');
        }
    };

    const AllocatePoints = (idx, event) => {
        const { value } = event.target;
        if (portalProfiles) {
            const pp = [...portalProfiles];
            let profileList = pp.map((x) => {
                return { ...x };
            });
            let pointsSpent = value;
            if (pointsSpent > 10) {
                pointsSpent = 10;
            }
            if (profileList[idx].PreviouslySpentPoints > pointsSpent) {
                pointsSpent = profileList[idx].PreviouslySpentPoints;
            }
            profileList[idx] = {
                ...profileList[idx],
                CurrentWeeksPoints: pointsSpent
            };

            const tp = { ...teamProfile };
            let total = 0;
            for (let i = 0; i < profileList.length; i++) {
                total += Number(profileList[i].CurrentWeeksPoints);
            }
            tp.SpentPoints = Number(total);
            setTeamProfile(() => tp);
            setPortalProfiles(() => profileList);
            Validate();
        }
    };

    const Validate = () => {
        const tp = { ...teamProfile };
        if (tp.SpentPoints > tp.WeeklyPoints) {
            setIsValid(() => false);
            return;
        }
        setIsValid(() => true);
    };

    const CommitPromise = async (dto) => {
        const promiseList = [...teamPromises];
        const board = [...portalProfiles];
        const profileIDX = board.findIndex(
            (x) => x.CollegePlayerID === dto.CollegePlayerID
        );
        if (profileIDX < 0) {
            toast.error(
                'ERROR: Could not create promise because player is no longer on board'
            );
            return;
        }

        const res = await _portalService.CreatePromise(isCFB, dto);
        if (res) {
            const promiseIDX = promiseList.findIndex((x) => x.ID === dto.ID);
            if (promiseIDX < 0) promiseList.push(res);
            else {
                promiseList[promiseIDX] = dto;
            }
            setTeamPromises(() => promiseList);

            board[profileIDX].Promise = dto;
            setPortalProfiles(() => board);
        }
    };

    const RemovePromise = async (idx, promise) => {
        const res = await _portalService.RemovePromise();

        const promises = [...teamPromises].filter(
            (x) =>
                x.ID !== promise.ID &&
                x.CollegePlayerID !== promise.CollegePlayerID
        );

        setTeamPromises(() => promises);
        const profiles = [...portalProfiles];
        const profilesIDX = profiles.findIndex(
            (x) => x.CollegePlayerID === promise.CollegePlayerID
        );
        if (profilesIDX < 0) {
            return;
        }
        profiles[profilesIDX].Promise = {};
        setPortalProfiles(() => profiles);
    };

    const SaveBoard = async () => {
        const pp = [...portalProfiles];
        for (let i = 0; i < pp.length; i++) {
            let curr = Number(pp[i].CurrentWeeksPoints);
            pp[i] = { ...pp[i], CurrentWeeksPoints: curr };
        }

        const saveBoardDTO = {
            Profile: teamProfile,
            Players: pp,
            TeamID: teamProfile.ID
        };

        const res = await _portalService.SaveBoard(isCFB, saveBoardDTO);

        if (res.ok) {
            toast.success('Transfer Portal Board has been saved!');
        } else {
            toast.error(
                'ERROR: Could not successfully save transfer portal board.'
            );
        }
    };

    const ExportPortal = async () => {
        await _portalService.ExportPortal(isCFB);
    };

    const loadRecords = () => {
        const newCount = [...viewablePlayers].concat(
            [...filteredPlayers].slice(count, count + 100)
        );
        setViewablePlayers(() => newCount);
        setCount((x) => x + 100);
    };

    const loadMoreRecords = () => {
        setTimeout(() => loadRecords(), 500);
    };

    if (!isCFB) {
        return (
            <>
                <div className="container-fluid mt-3">
                    <h2>
                        Please navigate to interface 2.0 to use the transfer
                        portal.
                    </h2>
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
    }

    return (
        <>
            <div className="container-fluid mt-3">
                {isLoading ? (
                    <Spinner />
                ) : (
                    <>
                        <div className="row">
                            <h4>{isCFB ? 'CFB' : 'CBB'} Transfer Portal</h4>
                        </div>
                        <div className="row">
                            <div className="col-sm-2">
                                <div className="row mb-2 px-4 d-flex justify-column-center">
                                    <button
                                        className="btn btn-primary export-btn"
                                        onClick={ExportPortal}
                                    >
                                        Export
                                    </button>
                                </div>
                                <div className="row mb-2 d-flex justify-column-center">
                                    <h5>{teamProfile.TeamAbbr} Profile</h5>
                                </div>
                                {isMobile ? (
                                    <>
                                        <div className="row mb-2 d-flex justify-column-center">
                                            <div className="col">
                                                <h6>State</h6>
                                                <p>{teamProfile.State}</p>
                                            </div>
                                            <div className="col">
                                                <h6>Region</h6>
                                                <p>{teamProfile.Region}</p>
                                            </div>
                                            <div className="col">
                                                <h6>Weekly Points</h6>
                                                <p>
                                                    {teamProfile.WeeklyPoints}
                                                </p>
                                            </div>
                                            <div className="col">
                                                <h6>Spent Points</h6>
                                                <p>{teamProfile.SpentPoints}</p>
                                            </div>
                                        </div>
                                        <div className="row mb-2 d-flex justify-column-center">
                                            <div className="col">
                                                <h6>Portal Reputation</h6>
                                                <p>
                                                    {
                                                        teamProfile.PortalReputation
                                                    }
                                                </p>
                                            </div>
                                            <div className="col">
                                                <h6>Total Promises Made</h6>
                                                <p>{activePromisesCount}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="row mb-2 d-flex justify-column-center">
                                            <div className="col-sm">
                                                <h6>State</h6>
                                                <p>{teamProfile.State}</p>
                                            </div>
                                            <div className="col-sm">
                                                <h6>Region</h6>
                                                <p>{teamProfile.Region}</p>
                                            </div>
                                        </div>
                                        <div className="row mb-2 d-flex justify-column-center">
                                            <div className="col-sm">
                                                <h6>Weekly Points</h6>
                                                <p>
                                                    {teamProfile.WeeklyPoints}
                                                </p>
                                            </div>
                                            <div className="col-sm">
                                                <h6>Spent Points</h6>
                                                <p>{teamProfile.SpentPoints}</p>
                                            </div>
                                        </div>
                                        <div className="row mb-2 d-flex justify-column-center">
                                            <div className="col-sm">
                                                <h6>Portal Reputation</h6>
                                                <p>
                                                    {
                                                        teamProfile.PortalReputation
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="row mb-2 d-flex justify-column-center">
                                            <div className="col-sm">
                                                <h6>Total Promises Made</h6>
                                                <p>{teamPromises.length}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="col-sm-10">
                                <div className="row mb-2">
                                    <ul className="nav nav-tabs">
                                        <GPTab
                                            activeView={activeView}
                                            gameplanType="Overview"
                                            setActiveView={setActiveView}
                                        />
                                        <GPTab
                                            activeView={activeView}
                                            gameplanType="Team Board"
                                            setActiveView={setActiveView}
                                        />
                                    </ul>
                                </div>
                                <>
                                    <PromisePlayerModal
                                        isCFB={isCFB}
                                        submit={CommitPromise}
                                        seasonID={ts.SeasonID}
                                        teams={allTeams}
                                        promisePlayer={
                                            viewProfile &&
                                            viewProfile.CollegePlayer
                                        }
                                        teamID={teamProfile.ID}
                                    />
                                    <ViewTransferPlayerModal
                                        player={viewPlayer}
                                        isCFB={isCFB}
                                        retro={currentUser.IsRetro}
                                        viewMode={viewMode}
                                    />
                                </>
                                {activeView === 'Overview' && (
                                    <>
                                        <div className="tp-dropdowns row mb-2">
                                            <div className="col-sm-auto col-6">
                                                <h5 className="text-start align-middle">
                                                    Positions
                                                </h5>
                                                <Select
                                                    options={positions}
                                                    isMulti={true}
                                                    className="basic-multi-select btn-dropdown-width-team z-index-5"
                                                    classNamePrefix="select"
                                                    onChange={ChangePositions}
                                                />
                                            </div>
                                            <div className="col-sm-auto col-6">
                                                <h5 className="text-start align-middle">
                                                    Overall
                                                </h5>
                                                <Select
                                                    options={letterGrades}
                                                    isMulti={true}
                                                    className="basic-multi-select btn-dropdown-width-team z-index-5"
                                                    classNamePrefix="select"
                                                    onChange={
                                                        ChangeOverallLetterGrades
                                                    }
                                                />
                                            </div>
                                            <div className="col-sm-auto col-6">
                                                <h5 className="text-start align-middle">
                                                    Potential
                                                </h5>
                                                <Select
                                                    options={letterGrades}
                                                    isMulti={true}
                                                    className="basic-multi-select btn-dropdown-width-team z-index-5"
                                                    classNamePrefix="select"
                                                    onChange={
                                                        ChangePotentialLetterGrades
                                                    }
                                                />
                                            </div>
                                            <div className="col-sm-auto col-6">
                                                <h5 className="text-start align-middle">
                                                    Stars
                                                </h5>
                                                <Select
                                                    options={stars}
                                                    isMulti={true}
                                                    className="basic-multi-select btn-dropdown-width-team z-index-5"
                                                    classNamePrefix="select"
                                                    onChange={ChangeStars}
                                                />
                                            </div>
                                            <div className="col-sm-auto col-6">
                                                <h5 className="text-start align-middle">
                                                    Schools
                                                </h5>
                                                <Select
                                                    options={teamList}
                                                    isMulti={true}
                                                    className="basic-multi-select btn-dropdown-width-team z-index-5"
                                                    classNamePrefix="select"
                                                    onChange={ChangeSchools}
                                                />
                                            </div>
                                        </div>
                                        <div
                                            className={`row mt-3 mb-5 dashboard-table-height${
                                                viewMode === 'dark'
                                                    ? '-dark'
                                                    : ''
                                            }`}
                                        >
                                            <InfiniteScroll
                                                dataLength={
                                                    viewablePlayers.length - 1
                                                }
                                                next={loadMoreRecords}
                                                hasMore={true}
                                                scrollThreshold={0.8}
                                                height={570}
                                                endMessage={
                                                    <div className="row justify-content-center">
                                                        <h4>
                                                            ...that's all the
                                                            players we have.
                                                        </h4>
                                                    </div>
                                                }
                                            >
                                                {isMobile ? (
                                                    <>
                                                        {viewablePlayers.length >
                                                            0 &&
                                                            viewablePlayers.map(
                                                                (x, idx) => (
                                                                    <TPOverviewMobileRow
                                                                        isCFB={
                                                                            isCFB
                                                                        }
                                                                        key={
                                                                            x.ID
                                                                        }
                                                                        player={
                                                                            x
                                                                        }
                                                                        rank={
                                                                            idx +
                                                                            1
                                                                        }
                                                                        setPortalPlayer={
                                                                            setViewPlayer
                                                                        }
                                                                        add={
                                                                            AddPlayerToBoard
                                                                        }
                                                                        portalMap={
                                                                            portalMap
                                                                        }
                                                                        timestamp={
                                                                            ts
                                                                        }
                                                                        theme={
                                                                            viewMode
                                                                        }
                                                                        retro={
                                                                            currentUser.IsRetro
                                                                        }
                                                                        teamProfile={
                                                                            teamProfile
                                                                        }
                                                                        ds={
                                                                            x.PreviousTeamID ===
                                                                            teamProfile.ID
                                                                        }
                                                                    />
                                                                )
                                                            )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <table
                                                            className={`table table-hover ${
                                                                viewMode ===
                                                                'dark'
                                                                    ? 'table-dark'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <TPOverviewHeader
                                                                isCFB={isCFB}
                                                                viewMode={
                                                                    viewMode
                                                                }
                                                            />
                                                            <tbody className="overflow-auto">
                                                                {viewablePlayers.length >
                                                                    0 &&
                                                                    viewablePlayers.map(
                                                                        (
                                                                            x,
                                                                            idx
                                                                        ) => (
                                                                            <TPOverviewRow
                                                                                isCFB={
                                                                                    isCFB
                                                                                }
                                                                                key={
                                                                                    x.ID
                                                                                }
                                                                                player={
                                                                                    x
                                                                                }
                                                                                rank={
                                                                                    idx +
                                                                                    1
                                                                                }
                                                                                setPortalPlayer={
                                                                                    setViewPlayer
                                                                                }
                                                                                add={
                                                                                    AddPlayerToBoard
                                                                                }
                                                                                portalMap={
                                                                                    portalMap
                                                                                }
                                                                                timestamp={
                                                                                    ts
                                                                                }
                                                                                theme={
                                                                                    viewMode
                                                                                }
                                                                                retro={
                                                                                    currentUser.IsRetro
                                                                                }
                                                                                teamProfile={
                                                                                    teamProfile
                                                                                }
                                                                                ds={
                                                                                    x.PreviousTeamID ===
                                                                                    teamProfile.ID
                                                                                }
                                                                            />
                                                                        )
                                                                    )}
                                                            </tbody>
                                                        </table>
                                                    </>
                                                )}
                                            </InfiniteScroll>
                                        </div>
                                    </>
                                )}
                                {activeView === 'Team Board' && (
                                    <>
                                        <div className="row d-flex justify-content-end mb-2">
                                            <div className="col-auto">
                                                <button
                                                    type="button"
                                                    className="btn btn-warning"
                                                    onClick={SaveBoard}
                                                    disabled={!isValid}
                                                >
                                                    Save Board
                                                </button>
                                            </div>
                                        </div>
                                        {isMobile ? (
                                            <>
                                                {portalProfiles &&
                                                    portalProfiles.length > 0 &&
                                                    portalProfiles.map(
                                                        (x, idx) => (
                                                            <TPProfileMobileRow
                                                                isCFB={isCFB}
                                                                key={x.ID}
                                                                profile={x}
                                                                idx={idx}
                                                                timestamp={ts}
                                                                theme={viewMode}
                                                                retro={
                                                                    currentUser.IsRetro
                                                                }
                                                                teamProfile={
                                                                    teamProfile
                                                                }
                                                                ds={
                                                                    x.PreviousTeamID ===
                                                                    teamProfile.ID
                                                                }
                                                                createPromise={
                                                                    CommitPromise
                                                                }
                                                                removePromise={
                                                                    RemovePromise
                                                                }
                                                                allocate={
                                                                    AllocatePoints
                                                                }
                                                                setProfile={
                                                                    setViewProfile
                                                                }
                                                                cancel={
                                                                    RemovePlayerFromBoard
                                                                }
                                                            />
                                                        )
                                                    )}
                                            </>
                                        ) : (
                                            <>
                                                <div
                                                    className={`row mt-3 mb-5 dashboard-table-height${
                                                        viewMode === 'dark'
                                                            ? '-dark'
                                                            : ''
                                                    }`}
                                                >
                                                    <>
                                                        <table
                                                            className={`table table-hover ${
                                                                viewMode ===
                                                                'dark'
                                                                    ? 'table-dark'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <TPBoardHeader
                                                                isCFB={isCFB}
                                                                viewMode={
                                                                    viewMode
                                                                }
                                                            />
                                                            <tbody className="overflow-auto">
                                                                {portalProfiles &&
                                                                    portalProfiles.length >
                                                                        0 &&
                                                                    portalProfiles.map(
                                                                        (
                                                                            x,
                                                                            idx
                                                                        ) => (
                                                                            <TPProfileRow
                                                                                isCFB={
                                                                                    isCFB
                                                                                }
                                                                                key={
                                                                                    x.ID
                                                                                }
                                                                                profile={
                                                                                    x
                                                                                }
                                                                                idx={
                                                                                    idx
                                                                                }
                                                                                timestamp={
                                                                                    ts
                                                                                }
                                                                                theme={
                                                                                    viewMode
                                                                                }
                                                                                retro={
                                                                                    currentUser.IsRetro
                                                                                }
                                                                                teamProfile={
                                                                                    teamProfile
                                                                                }
                                                                                ds={
                                                                                    x.PreviousTeamID ===
                                                                                    teamProfile.ID
                                                                                }
                                                                                createPromise={
                                                                                    CommitPromise
                                                                                }
                                                                                removePromise={
                                                                                    RemovePromise
                                                                                }
                                                                                allocate={
                                                                                    AllocatePoints
                                                                                }
                                                                                setProfile={
                                                                                    setViewProfile
                                                                                }
                                                                                cancel={
                                                                                    RemovePlayerFromBoard
                                                                                }
                                                                            />
                                                                        )
                                                                    )}
                                                            </tbody>
                                                        </table>
                                                    </>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

const mapStateToProps = ({
    user: { currentUser },
    timestamp: { cbb_Timestamp, cfb_Timestamp },
    cfbTeam: { cfbTeam },
    cbbTeam: { cbbTeam },
    viewMode: { viewMode }
}) => ({
    currentUser,
    cfbTeam,
    cbbTeam,
    cbb_Timestamp,
    cfb_Timestamp,
    viewMode
});

export default connect(mapStateToProps)(TransferPortal);
