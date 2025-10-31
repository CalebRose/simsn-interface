import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
// import { connect, useDispatch, useSelector } from 'react-redux';
import { connect } from 'react-redux';
import PlayerRow from './PlayerRow';
import FBAPlayerService from '../../_Services/simFBA/FBAPlayerService';
import FBATeamService from '../../_Services/simFBA/FBATeamService';
import { GetDefaultOrder } from '../../_Utility/RosterHelper';
import { useMediaQuery } from 'react-responsive';
import ConfirmRedshirtModal from './RedshirtModal';
import PlayerModal from './PlayerModal';
import MobileRosterRow from './MobileRosterRow';
import { numberWithCommas } from '../../_Utility/utilHelper';
import { DropdownItemObj } from './DropdownItem';
import {
    PromisePlayerModal,
    TeamPromisesModal
} from '../_Common/ModalComponents';
import { PortalService } from '../../_Services/simFBA/FBAPortalService';

const Roster = ({ currentUser, cfbTeam, cfb_Timestamp, viewMode }) => {
    /* 
        API Call to get team data
        Loop through array list to acquire players
    */
    let rosterService = new FBAPlayerService();
    let teamService = new FBATeamService();
    let _portalService = new PortalService();
    // React Hooks for Modal
    //
    const [modalState, setModal] = useState(false);
    const [userTeam, setUserTeam] = useState(cfbTeam);
    const [viewingUserTeam, setViewingUserTeam] = useState(true);
    const [team, setTeam] = useState(cfbTeam); // Redux value as initial value for react hook
    const [coachMap, setCoachMap] = useState(null);
    const [teams, setTeams] = useState([]);
    const [roster, setRoster] = useState([]);
    const [promises, setPromises] = useState([]);
    const [promisePlayer, setPromisePlayer] = useState(null);
    const [rosterMap, setRosterMap] = useState({});
    const [viewRoster, setViewRoster] = useState([]);
    const [sort, setSort] = useState('ovr');
    const [isAsc, setIsAsc] = useState(false);
    const [viewWidth, setViewWidth] = useState(window.innerWidth);
    const isMobile = useMediaQuery({ query: `(max-width:760px)` });
    const coach = coachMap && coachMap[team.ID];

    // For mobile
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
            getTeams();
        }
    }, [currentUser]);

    useEffect(() => {
        if (team && team.ID > 0) {
            getRoster(team.ID);
        }
    }, [team]);

    // Functions
    const selectTeam = (team) => {
        setTeam(team);
    };

    const selectUserTeam = () => {
        selectTeam(userTeam);
    };

    const getTeams = async () => {
        //
        let res = await teamService.GetAllCollegeTeamsForRosterPage();
        const { Teams, Coaches } = res;
        const designatedMap = {};
        for (let i = 0; i < Coaches.length; i++) {
            const coach = Coaches[i];
            designatedMap[coach.TeamID] = coach;
        }
        setCoachMap(() => designatedMap);
        setTeams(() => Teams);
    };

    const getRoster = async (ID) => {
        if (ID !== null || ID > 0) {
            const res = await rosterService.GetCFBRosterDataByTeamID(ID);
            const { Players, Promises } = res;
            setRoster(() => [...Players]);
            setViewRoster(() => [...Players]);
            setPromises(() => [...Promises]);
            const rMap = {};
            for (let i = 0; i < Players.length; i++) {
                rMap[Players[i].ID] = Players[i];
            }
            setRosterMap(() => rMap);

            if (ID !== userTeam.ID) {
                setViewingUserTeam((x) => false);
            } else {
                setViewingUserTeam((x) => true);
            }
        }
    };
    // Priority Queue

    const teamDropDowns =
        teams && teams.length > 0
            ? teams.map((x) => (
                  <DropdownItemObj
                      key={x.ID}
                      value={x.TeamName + ' ' + x.Mascot}
                      team={x}
                      id={x.ID}
                      click={selectTeam}
                  />
              ))
            : '';

    // Rows
    const playerCount = viewRoster ? viewRoster.length : 0;

    let redshirtCount = viewRoster
        ? viewRoster.filter((player) => player.IsRedshirting).length
        : 0;

    const setSortValues = (value) => {
        const newSort = value;

        // determine default sort by attribute selected
        const isAscending = GetDefaultOrder(newSort, sort, isAsc);

        switch (newSort) {
            case 'ovr':
                setViewRoster(() =>
                    [...roster].sort(
                        (a, b) =>
                            (a.Overall - b.Overall) * (isAscending ? 1 : -1)
                    )
                );
                break;
            case 'name':
                setViewRoster(() =>
                    [...roster].sort(
                        (a, b) =>
                            a.LastName.localeCompare(b.LastName) *
                            (isAscending ? 1 : -1)
                    )
                );
                break;
            case 'year':
                setViewRoster(() =>
                    [...roster].sort(
                        (a, b) => (a.Year - b.Year) * (isAscending ? 1 : -1)
                    )
                );
                break;
            case 'pos':
                setViewRoster(() =>
                    [...roster].sort(
                        (a, b) =>
                            a.Position.localeCompare(b.Position) *
                            (isAscending ? 1 : -1)
                    )
                );
                break;
            case 'pot':
                setViewRoster(() =>
                    [...roster].sort(
                        (a, b) =>
                            a.PotentialGrade.localeCompare(b.PotentialGrade) *
                            (isAscending ? 1 : -1)
                    )
                );
                break;
            case 'arch':
                setViewRoster(() =>
                    [...roster].sort(
                        (a, b) =>
                            a.Archetype.localeCompare(b.Archetype) *
                            (isAscending ? 1 : -1)
                    )
                );
                break;
            default:
                break;
        }

        setSort((currValue) => newSort);
        setIsAsc((asc) => isAscending);
    };

    const setPromisePlayerForModal = (id) => {
        const r = [...roster];
        const playerIdx = r.findIndex((x) => x.PlayerID === id);
        if (playerIdx > -1) {
            const pl = r[playerIdx];
            setPromisePlayer(() => pl);
        }
    };

    const exportRoster = async () => {
        // Removing if-check on if team is the user's...
        let response = rosterService.ExportRoster(team.ID, team.TeamName);
        if (response) {
            //
        }
    };

    const setRedshirtStatus = async (player) => {
        const PlayerID = player.ID;
        const playerRoster = [...viewRoster];
        const originalRoster = [...roster];
        const playerIDX = playerRoster.findIndex((x) => x.ID === PlayerID);
        const originalIDX = originalRoster.findIndex((x) => x.ID === PlayerID);
        playerRoster[playerIDX].IsRedshirting = true;
        originalRoster[originalIDX].IsRedshirting = true;

        const response = await rosterService.AssignRedshirt(PlayerID);
        if (!response) {
            toast.error(
                `${player.Position} ${player.FirstName} ${player.LastName} could not be redshirted. Please reach out to admins for assistance.`
            );
            return;
        }
        toast.success(
            `${player.Position} ${player.FirstName} ${player.LastName} has been redshirted!`
        );
        setRoster(() => originalRoster);
        setViewRoster(() => playerRoster);
    };

    const CutToast = (player) => {
        toast.promise(CutPlayer(player), {
            loading: 'Cutting player...',
            success: 'Player has been released to the transfer portal.',
            error: 'Error! Promise could not cut player from team.'
        });
    };

    const CutPlayer = async (player) => {
        const res = await rosterService.CutCFBPlayerFromRoster(player.ID);
        const currentRoster = [...roster];
        setRoster(() => []);
        const filteredRoster = currentRoster.filter((x) => x.ID !== player.ID);
        setRoster(() => filteredRoster);
        setViewRoster(() => filteredRoster);
    };

    const MakePromise = (dto) => {
        toast.promise(submitPromise(dto), {
            loading: 'Committing promise...',
            success: 'Promise Created',
            error: 'Error! Promise could not properly be created. Please reach out to Tuscan for assistance.'
        });
    };
    const submitPromise = async (dto) => {
        const res = await _portalService.CreatePromise(true, dto);
        const pr = [...promises];
        pr.push(dto);
        setPromises(() => pr);
    };
    const tableClass = viewMode === 'light' ? '' : 'table-dark';

    return (
        <div className="container-fluid">
            <div className="row userInterface">
                <h2 className="">{team ? team.TeamName : ''} Roster</h2>
            </div>
            <div className="row">
                <div className="col-md-2">
                    <div className="row mb-1">
                        <h6>Conference: {team && team.Conference}</h6>
                    </div>
                    {team !== undefined && team.DivisionID > 0 && (
                        <div className="row mb-1">
                            <h6>Division: {team && team.Division}</h6>
                        </div>
                    )}

                    <div className="row mb-1">
                        <h6>Stadium: {team && team.Stadium}</h6>
                    </div>
                    <div className="row mb-1">
                        <h6>
                            Stadium Capacity:{' '}
                            {team && numberWithCommas(team.StadiumCapacity)}
                        </h6>
                    </div>
                    {coach && (
                        <>
                            <div className="row mb-1">
                                <h6>Coach: {coach.CoachName}</h6>
                            </div>
                            {coach.Age > 0 && (
                                <div className="row mb-1">
                                    <h6>Age: {coach.Age}</h6>
                                </div>
                            )}
                            {coach.Prestige > 0 && (
                                <div className="row mb-1">
                                    <h6>Prestige: {coach.Prestige}</h6>
                                </div>
                            )}
                            {coach.OffensiveScheme &&
                                coach.OffensiveScheme.length > 0 && (
                                    <div className="row mb-1">
                                        <h6>
                                            Offensive Scheme:{' '}
                                            {coach.OffensiveScheme}
                                        </h6>
                                    </div>
                                )}
                            {coach.DefensiveScheme &&
                                coach.DefensiveScheme.length > 0 && (
                                    <div className="row mb-1">
                                        <h6>
                                            Defensive Scheme:{' '}
                                            {coach.DefensiveScheme}
                                        </h6>
                                    </div>
                                )}
                            {coach.TeambuildingPreference &&
                                coach.TeambuildingPreference.length > 0 && (
                                    <div className="row mb-1">
                                        <h6>
                                            Team Building Preference:{' '}
                                            {coach.TeambuildingPreference}
                                        </h6>
                                    </div>
                                )}
                            {coach.PromiseTendency &&
                                coach.PromiseTendency.length > 0 && (
                                    <div className="row mb-1">
                                        <h6>
                                            Promise Tendency:{' '}
                                            {coach.PromiseTendency}
                                        </h6>
                                    </div>
                                )}
                            {coach.CareerPreference &&
                                coach.CareerPreference.length > 0 && (
                                    <div className="row mb-1">
                                        <h6>
                                            Career Preference:{' '}
                                            {coach.CareerPreference}
                                        </h6>
                                    </div>
                                )}
                            {coach.PortalReputation > 0 && (
                                <div className="row mb-1">
                                    <h6>
                                        Reputation: {coach.PortalReputation}
                                    </h6>
                                </div>
                            )}
                        </>
                    )}
                    <div className="row mb-1 px-4">
                        <button
                            className="btn btn-primary"
                            disabled={promises.length === 0}
                            data-bs-toggle="modal"
                            data-bs-target="#teamPromisesModal"
                        >
                            Promises
                        </button>
                    </div>
                </div>
                <TeamPromisesModal
                    promises={promises}
                    rosterMap={rosterMap}
                    team={team}
                    isCFB
                />

                {cfb_Timestamp && (
                    <PromisePlayerModal
                        promisePlayer={promisePlayer}
                        submit={MakePromise}
                        teams={teams}
                        seasonID={cfb_Timestamp.CollegeSeasonID}
                        teamID={team.ID}
                        isCFB
                    />
                )}

                <div className="col-md-10">
                    <div className="row">
                        <div className="col-4">
                            <div className="btn-group btn-dropdown-width-auto">
                                <div className="drop-start btn-dropdown-width-auto">
                                    <button
                                        name="team"
                                        className="btn btn-secondary dropdown-toggle btn-dropdown-width-auto"
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
                                            click={selectUserTeam}
                                            id={
                                                currentUser
                                                    ? currentUser.teamId
                                                    : null
                                            }
                                        />
                                        <hr className="dropdown-divider"></hr>
                                        {teamDropDowns}
                                    </ul>
                                </div>
                                {!isMobile && (
                                    <div className="export ms-2">
                                        <button
                                            className="btn btn-primary export-btn"
                                            onClick={exportRoster}
                                        >
                                            Export
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-4">
                            <h2>Players: {playerCount}</h2>
                        </div>
                        <div className="col-4">
                            <h2>Redshirts: {redshirtCount}</h2>
                        </div>
                    </div>
                    <div className="row">
                        {!isMobile ? (
                            <div
                                className={`table-wrapper table-height ${
                                    viewMode === 'dark'
                                        ? 'table-height-dark'
                                        : ''
                                }`}
                            >
                                <table
                                    className={
                                        viewWidth >= 901
                                            ? 'table table-hover ' + tableClass
                                            : 'table table-sm ' + tableClass
                                    }
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                scope="col"
                                                onClick={() =>
                                                    setSortValues('name')
                                                }
                                            >
                                                <abbr>Name</abbr>
                                            </th>
                                            <th scope="col">
                                                <abbr
                                                    title="Archetype"
                                                    onClick={() =>
                                                        setSortValues('arch')
                                                    }
                                                >
                                                    Archetype
                                                </abbr>
                                            </th>
                                            <th scope="col">
                                                <abbr
                                                    title="Position"
                                                    onClick={() =>
                                                        setSortValues('pos')
                                                    }
                                                >
                                                    Pos
                                                </abbr>
                                            </th>
                                            <th
                                                scope="col"
                                                onClick={() =>
                                                    setSortValues('ovr')
                                                }
                                            >
                                                <abbr title="Overall">Ovr</abbr>
                                            </th>
                                            <th scope="col">
                                                <abbr
                                                    title="Year"
                                                    onClick={() =>
                                                        setSortValues('year')
                                                    }
                                                >
                                                    Yr
                                                </abbr>
                                            </th>
                                            <th scope="col">
                                                <abbr title="Height">Ht</abbr>
                                            </th>
                                            <th scope="col">
                                                <abbr title="Weight">Wt</abbr>
                                            </th>
                                            <th scope="col">
                                                <abbr title="State">State</abbr>
                                            </th>{' '}
                                            <th scope="col">
                                                <abbr title="Stars">Stars</abbr>
                                            </th>
                                            <th
                                                scope="col"
                                                onClick={() =>
                                                    setSortValues('pot')
                                                }
                                            >
                                                <abbr title="Potential">
                                                    Pot
                                                </abbr>
                                            </th>
                                            <th scope="col">
                                                <abbr title="Potential">
                                                    Health
                                                </abbr>
                                            </th>
                                            <th scope="col">
                                                <abbr title="Redshirt">
                                                    Actions
                                                </abbr>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cfb_Timestamp &&
                                            viewRoster &&
                                            viewRoster.length > 0 &&
                                            viewRoster.map((player, idx) => (
                                                <>
                                                    <ConfirmRedshirtModal
                                                        idx={idx}
                                                        setRedshirtStatus={
                                                            setRedshirtStatus
                                                        }
                                                        player={player}
                                                        viewMode={viewMode}
                                                    />
                                                    <PlayerModal
                                                        player={player}
                                                        team={team}
                                                        idx={idx}
                                                        viewMode={viewMode}
                                                        retro={
                                                            currentUser.IsRetro
                                                        }
                                                    />
                                                    <PlayerRow
                                                        key={player.ID}
                                                        idx={idx}
                                                        data={player}
                                                        width={viewWidth}
                                                        redshirtCount={
                                                            redshirtCount
                                                        }
                                                        view={viewingUserTeam}
                                                        ts={cfb_Timestamp}
                                                        theme={viewMode}
                                                        retro={
                                                            currentUser.IsRetro
                                                        }
                                                        rosterCount={
                                                            playerCount
                                                        }
                                                        setPromisePlayer={
                                                            setPromisePlayerForModal
                                                        }
                                                        cutPlayer={CutToast}
                                                    />
                                                </>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <>
                                {cfb_Timestamp &&
                                    viewRoster &&
                                    viewRoster.length > 0 &&
                                    viewRoster.map((player, idx) => (
                                        <>
                                            <ConfirmRedshirtModal
                                                idx={idx}
                                                setRedshirtStatus={
                                                    setRedshirtStatus
                                                }
                                                player={player}
                                                viewMode={viewMode}
                                            />
                                            <PlayerModal
                                                player={player}
                                                team={team}
                                                idx={idx}
                                                viewMode={viewMode}
                                                retro={currentUser.IsRetro}
                                            />
                                            <MobileRosterRow
                                                key={player.ID}
                                                idx={idx}
                                                data={player}
                                                width={viewWidth}
                                                redshirtCount={redshirtCount}
                                                view={viewingUserTeam}
                                                ts={cfb_Timestamp}
                                                theme={viewMode}
                                                setPromisePlayer={
                                                    setPromisePlayerForModal
                                                }
                                                retro={currentUser.IsRetro}
                                                cutPlayer={CutToast}
                                                rosterCount={playerCount}
                                            />
                                        </>
                                    ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = ({
    user: { currentUser },
    cfbTeam: { cfbTeam },
    timestamp: { cfb_Timestamp },
    viewMode: { viewMode }
}) => ({
    currentUser,
    cfbTeam,
    cfb_Timestamp,
    viewMode
});

export default connect(mapStateToProps)(Roster);
