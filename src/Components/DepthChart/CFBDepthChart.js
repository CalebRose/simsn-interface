import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import FBADepthChartService from '../../_Services/simFBA/FBADepthChartService';
import FBAPlayerService from '../../_Services/simFBA/FBAPlayerService';
import FBATeamService from '../../_Services/simFBA/FBATeamService';
import DCPositionItem from './DC_PositionItem';
import { DepthChartPositionList } from './DepthChartConstants';
import DepthChartHeader from './DepthChartHeader';
import { GetAvailablePlayers, GetPositionAttributes } from './DepthChartHelper';
import DepthChartPlayerRow from './DepthChartPlayerRow';
import DepthChartMobilePlayerRow from './DepthChartMobilePlayerRow';
import { DropdownItemObj } from '../Roster/DropdownItem';
import routes from '../../Constants/routes';
import { SchemeInfo } from '../Gameplan/SchemeInfo';
import { FormationMap } from '../Gameplan/GameplanConstants';

const CFBDepthChart = ({ currentUser, cfbTeam, viewMode, isNFL }) => {
    // Services
    let depthChartService = new FBADepthChartService();
    let teamService = new FBATeamService();
    let rosterService = new FBAPlayerService();

    // Hooks
    const [userTeam, setUserTeam] = useState('');
    const [team, setTeam] = useState('');
    const [teamColors, setTeamColors] = useState('');
    const [collegeTeams, setCollegeTeams] = useState('');
    const [roster, setRoster] = useState([]);
    const [rosterMap, setRosterMap] = useState({});
    const [initialDC, setInitialDC] = useState([]);
    const [currentDepthChart, setCurrentDepthChart] = useState(null);
    const [offensiveScheme, setOffensiveScheme] = useState(null);
    const [defensiveScheme, setDefensiveScheme] = useState(null);
    const [currentScheme, setCurrentScheme] = useState(null);
    const [isOffense, setIsOffense] = useState(true);
    const [positions, setPositions] = useState([]);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [positionAttributes, setPositionAttributes] = useState([]);
    const [currentDepthChartPositions, setCurrentDepthChartPositions] =
        useState([]);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [canModify, setCanModify] = useState(false);
    const [isValid, setValidation] = useState(false);
    const [viewWidth, setViewWidth] = useState(window.innerWidth);
    const isMobile = useMediaQuery({ query: `(max-width:844px)` });

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

    // UseEffects
    useEffect(() => {
        if (currentUser) {
            GetTeams();
            setPositions(DepthChartPositionList);
        }
    }, [currentUser]);

    useEffect(() => {
        if (cfbTeam) {
            setTeam(cfbTeam);
            setUserTeam(cfbTeam);
        }
    }, [cfbTeam]);

    useEffect(() => {
        if (team) {
            setCanModify(
                team.ID === currentUser.teamId || currentUser.roleID === 'Admin'
            );
            GetRoster(team.ID);
            GetDepthChart(team.ID);
            const colors = {
                color: team && team.ColorTwo ? team.ColorTwo : '#000',
                backgroundColor:
                    team && team.ColorOne ? team.ColorOne : '#6c757d',
                borderColor: team && team.ColorTwo ? team.ColorTwo : '#6c757d'
            };
            setTeamColors(colors);
            setCurrentPosition({
                name: 'Quarterbacks',
                abbr: 'QB'
            });
        }
    }, [team]);

    useEffect(() => {
        if (currentDepthChart) {
            SetDepthChartAttributeHeaders(currentPosition);
            SetAvailablePlayersList(currentPosition);
            SetDepthChartPositionList(currentPosition);
            ValidateDepthChart();
        }
    }, [currentDepthChart, currentPosition]);

    // OnClickEvents
    const SelectTeam = (selectedTeam) => {
        setTeam(() => selectedTeam);
    };

    const SelectUserTeam = () => {
        SelectTeam(userTeam);
    };

    const SelectPosition = (pos) => {
        setCurrentPosition(() => pos);
        const { abbr } = pos;
        if (
            abbr === 'QB' ||
            abbr === 'FB' ||
            abbr === 'RB' ||
            abbr === 'WR' ||
            abbr === 'TE' ||
            abbr === 'LT' ||
            abbr === 'RT' ||
            abbr === 'LG' ||
            abbr === 'RG' ||
            abbr === 'C'
        ) {
            setCurrentScheme(() => offensiveScheme);
            setIsOffense(() => true);
        } else {
            setIsOffense(() => false);
            setCurrentScheme(() => defensiveScheme);
        }
    };

    const SaveToast = () => {
        toast.promise(SaveDepthChart(), {
            loading: 'Saving...'
        });
    };

    const SaveDepthChart = async () => {
        if (!isValid || !canModify) return;
        const dc = currentDepthChart.map((x) => ({
            ID: x.ID,
            DepthChartID: x.DepthChartID,
            PlayerID: x.PlayerID,
            Position: x.Position,
            PositionLevel: x.PositionLevel,
            FirstName: x.FirstName,
            LastName: x.LastName,
            OriginalPosition: x.CollegePlayer.Position
        }));
        const UpdateDepthChartDTO = {
            DepthChartID: dc[0].DepthChartID,
            UpdatedPlayerPositions: dc
        };

        const save = await depthChartService.SaveDepthChart(
            UpdateDepthChartDTO
        );

        if (save.ok) {
            toast.success('Successfully Saved Gameplan!', {
                style: {
                    border: `1px solid ${team.ColorOne}`,
                    padding: '16px',
                    color: team.ColorTwo
                },
                iconTheme: {
                    primary: team.ColorOne,
                    secondary: team.ColorTwo
                },
                duration: 4000
            });
        } else {
            toast.error('Could not save depth chart.');
        }

        // Update Initial DC
        const newInitialDC = currentDepthChart.map((x) => ({ ...x }));
        setInitialDC(newInitialDC);
    };

    // Functions
    const SetDepthChartAttributeHeaders = (position) => {
        const { abbr, name } = position;
        let attributes = GetPositionAttributes(abbr);
        setPositionAttributes(() => attributes);
    };

    const SetAvailablePlayersList = (position) => {
        if (roster.length > 0) {
            const { abbr } = position;
            let rosterList = [...roster];
            let players = GetAvailablePlayers(abbr, rosterList);
            setAvailablePlayers(() => players);
        }
    };

    const SetDepthChartPositionList = (position) => {
        const { abbr } = position;
        const dc = [...currentDepthChart];
        if (dc.length > 0) {
            const newPositionsList = dc.filter((x) => x.Position === abbr);
            setCurrentDepthChartPositions(() => newPositionsList);
        }
    };

    const GetTeams = async () => {
        //
        let teams = await teamService.GetAllCollegeTeams();
        setCollegeTeams(() => teams);
    };

    const GetRoster = async (ID) => {
        if (ID !== null || ID > 0) {
            let roster = await rosterService.GetPlayersByTeamNoRedshirts(ID);
            setRoster(() => roster);
            const rMap = {};
            for (let i = 0; i < roster.length; i++) {
                rMap[roster[i].ID] = true;
            }
            setRosterMap(() => rMap);
        }
    };

    const GetDepthChart = async (ID) => {
        if (ID !== null || ID > 0) {
            let res = await depthChartService.GetDepthChartByTeamID(ID);

            if (res) {
                const depthChartResponse = res.CFBDepthChart;
                const gp = res.CFBGameplan;
                setOffensiveScheme(() => gp.OffensiveScheme);
                setCurrentScheme(() => gp.OffensiveScheme);
                setDefensiveScheme(() => gp.DefensiveScheme);

                setCurrentDepthChart((x) =>
                    depthChartResponse.DepthChartPlayers.map((x) => ({ ...x }))
                );
                setInitialDC((x) =>
                    depthChartResponse.DepthChartPlayers.map((x) => ({ ...x }))
                );
            }
        }
    };

    const ResetCurrentDepthChart = () => {
        if (!canModify) return;

        const originalDepthChart = initialDC.map((x) => ({
            ...x
        }));
        toast('Depth Chart has been reset', {
            style: {
                border: `1px solid ${team.ColorOne}`,
                padding: '16px',
                color: '#000'
            },
            iconTheme: {
                primary: team.ColorOne,
                secondary: team.ColorTwo
            },
            duration: 4000
        });
        setCurrentDepthChart((x) => originalDepthChart);
    };

    const SwapPlayer = (depthChartRow, newPlayer) => {
        const originalPlayer = depthChartRow.CollegePlayer;
        const dc = [...currentDepthChart];
        // Check if the new player is existing in the position depth chart
        const originalPlayerRowIndex = dc.findIndex(
            (x) => x.ID === depthChartRow.ID
        );

        const existingOnDepthChartIndex = dc.findIndex(
            (x) =>
                x.Position === depthChartRow.Position &&
                x.PlayerID === newPlayer.PlayerID
        );

        if (existingOnDepthChartIndex > 0) {
            // If the player does exist in a different level on the depth chart, conduct a swap
            const newPlayerRow = dc[existingOnDepthChartIndex];

            // Swap the first name, last name, player ID, and CollegePlayer Records between both
            const temp = {
                PlayerID: newPlayerRow.PlayerID,
                FirstName: newPlayerRow.FirstName,
                LastName: newPlayerRow.LastName,
                OriginalPosition: newPlayer.Position,
                CollegePlayer: newPlayer
            };

            dc[existingOnDepthChartIndex].PlayerID =
                dc[originalPlayerRowIndex].PlayerID;
            dc[existingOnDepthChartIndex].FirstName =
                dc[originalPlayerRowIndex].FirstName;
            dc[existingOnDepthChartIndex].LastName =
                dc[originalPlayerRowIndex].LastName;
            dc[existingOnDepthChartIndex].OriginalPosition =
                originalPlayer.Position;
            dc[existingOnDepthChartIndex].CollegePlayer = originalPlayer;

            dc[originalPlayerRowIndex].PlayerID = temp.PlayerID;
            dc[originalPlayerRowIndex].FirstName = temp.FirstName;
            dc[originalPlayerRowIndex].LastName = temp.LastName;
            dc[originalPlayerRowIndex].OriginalPosition = temp.OriginalPosition;
            dc[originalPlayerRowIndex].CollegePlayer = temp.CollegePlayer;
        } else {
            // If the player does not exist yet on the depth chart...
            dc[originalPlayerRowIndex].PlayerID = newPlayer.PlayerID;
            dc[originalPlayerRowIndex].FirstName = newPlayer.FirstName;
            dc[originalPlayerRowIndex].LastName = newPlayer.LastName;
            dc[originalPlayerRowIndex].OriginalPosition = newPlayer.Position;
            dc[originalPlayerRowIndex].CollegePlayer = newPlayer;
        }
        setCurrentDepthChart(() => dc);
    };

    const ValidateDepthChart = () => {
        if (!canModify) {
            toast.error(
                (t) => (
                    <span>
                        Viewing other team's depth charts in read-only mode.
                        <button onClick={() => toast.dismiss(t.id)}>
                            Dismiss
                        </button>
                    </span>
                ),

                { duration: 6000 }
            );
            return;
        }

        let validStatus = true;

        const dc = [...currentDepthChart];
        let DepthChartMap = {};
        // It is not possible to have duplicate records under the same position
        for (let i = 0; i < dc.length; i++) {
            let row = dc[i];
            const pos = row.Position;
            let NameKey = row.FirstName + row.LastName + row.PlayerID;
            if (!rosterMap[row.PlayerID]) {
                toast.error(
                    (t) => (
                        <span>
                            {row.FirstName} {row.LastName} is no longer on the
                            team. Please swap them from their {row.Position}{' '}
                            position level.
                            <button onClick={() => toast.dismiss(t.id)}>
                                Dismiss
                            </button>
                        </span>
                    ),
                    { duration: 10000 }
                );
                setValidation(() => false);
            }
            if (row.CollegePlayer.IsRedshirting) {
                toast.error(
                    (t) => (
                        <span>
                            {row.FirstName} {row.LastName} is currently a
                            redshirt player. Please swap them from their{' '}
                            {row.Position} position level.
                            <button onClick={() => toast.dismiss(t.id)}>
                                Dismiss
                            </button>
                        </span>
                    ),
                    { duration: 10000 }
                );
                setValidation(() => false);
                return;
            }
            if (row.CollegePlayer.IsInjured) {
                toast.error(
                    (t) => (
                        <span>
                            {row.FirstName} {row.LastName} is injured with{' '}
                            {row.CollegePlayer.InjuryType}. They are unable to
                            play for {row.CollegePlayer.WeeksOfRecovery} Weeks.
                            Please swap them from their {row.Position} position
                            level.
                            <button onClick={() => toast.dismiss(t.id)}>
                                Dismiss
                            </button>
                        </span>
                    ),
                    { duration: 10000 }
                );
                setValidation(() => false);
                return;
            }
            let isSpecialTeamsPosition =
                pos === 'P' ||
                pos === 'K' ||
                pos === 'PR' ||
                pos === 'KR' ||
                pos === 'FG' ||
                pos === 'STU';

            if (!DepthChartMap[NameKey]) {
                DepthChartMap[NameKey] = {};
            }

            if (!isSpecialTeamsPosition) {
                DepthChartMap[NameKey][pos] = row.PositionLevel;
                let FirstStringCount = 0;
                for (var key in DepthChartMap[NameKey]) {
                    if (DepthChartMap[NameKey][key] === '1') {
                        FirstStringCount++;
                    }
                    if (FirstStringCount > 1) {
                        validStatus = false;
                        break;
                    }
                }

                if (!validStatus) {
                    setValidation(validStatus);
                    let isLinemenPosition =
                        pos === 'LT' ||
                        pos === 'LG' ||
                        pos === 'C' ||
                        pos === 'RG' ||
                        pos === 'RT';

                    if (isLinemenPosition) {
                        toast.error(
                            `You have an offensive linemen set at First String for two OLine Positions. Please resolve this issue.`
                        );
                        return;
                    }
                    let isDlinePosition =
                        pos === 'DT' || pos === 'LE' || pos === 'RE';

                    if (isDlinePosition) {
                        toast.error(
                            `You have a defensive linemen set at First String for two DLine Positions. Please resolve this issue`,
                            { duration: 6000 }
                        );
                        return;
                    }

                    let isLinebackerPosition =
                        pos === 'LOLB' || pos === 'OLB' || pos === 'MLB';

                    if (isLinebackerPosition) {
                        toast.error(
                            `You have a linebacker set at First String for Linebacker positions. Please resolve this issue`,
                            { duration: 6000 }
                        );

                        return;
                    }

                    let isSecondaryPosition =
                        pos === 'CB' || pos === 'FS' || pos === 'SS';

                    if (isSecondaryPosition)
                        toast.error(
                            `You have a defensive back set at First String for two DB Positions. Please resolve this issue`,
                            { duration: 6000 }
                        );
                    return;
                }
            }
        }
        if (validStatus) {
            toast.success('Ready to save!', {
                style: {
                    border: `1px solid ${team.ColorOne}`,
                    padding: '16px',
                    color: team.ColorTwo
                },
                iconTheme: {
                    primary: team.ColorOne,
                    secondary: team.ColorTwo
                },
                duration: 2000
            });
        }
        setValidation(() => validStatus);
    };

    return (
        <div className="container-fluid mt-3 cfb-depthchart-container">
            <div className="row mb-2">
                <div className="col-md-auto justify-content-start">
                    <h2>{team && `${team.TeamName} `}Depth Chart</h2>
                </div>
                <div className="col-md-auto ms-auto">
                    <Link
                        to={isNFL ? routes.NFL_GAMEPLAN : routes.CFB_GAMEPLAN}
                        type="button"
                        className="btn btn-primary btn-md me-2 shadow"
                    >
                        Gameplan
                    </Link>
                    {canModify && (
                        <button
                            className="btn btn-danger me-2"
                            onClick={ResetCurrentDepthChart}
                        >
                            Reset Depth Chart
                        </button>
                    )}

                    <button
                        className="btn btn-primary"
                        onClick={SaveToast}
                        disabled={!(isValid && canModify)}
                    >
                        Save Depth Chart
                    </button>
                </div>
            </div>
            <div className="row">
                <div className="col-md-2 mb-2">
                    {currentScheme && canModify && (
                        <div className={`card text-start`}>
                            <div className="card-body">
                                <h5 className="card-title">Current Scheme</h5>
                                <h6>{currentScheme}</h6>

                                <SchemeInfo
                                    formationMap={FormationMap}
                                    scheme={currentScheme}
                                />
                            </div>
                        </div>
                    )}
                    {!canModify && (
                        <div className={`card text-start`}>
                            <div className="card-body">
                                <h5 className="card-title">Current Scheme</h5>
                                <h6>Read-Only Mode</h6>
                                <p>
                                    When viewing another team in read-only mode,
                                    the scheme the team is using cannot be
                                    viewed.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="col-md-10 px-md-4 py-md-2 border rounded">
                    <div className="row">
                        <div className="col-md-auto">
                            <div className="drop-start btn-dropdown-width-team mt-1 mb-1">
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
                                        id={
                                            currentUser
                                                ? currentUser.teamId
                                                : null
                                        }
                                    />
                                    <hr className="dropdown-divider"></hr>
                                    {collegeTeams && collegeTeams.length > 0
                                        ? collegeTeams.map((x) => (
                                              <DropdownItemObj
                                                  key={x.ID}
                                                  value={
                                                      x.TeamName +
                                                      ' ' +
                                                      x.Mascot
                                                  }
                                                  team={x}
                                                  id={x.ID}
                                                  click={SelectTeam}
                                              />
                                          ))
                                        : ''}
                                </ul>
                            </div>
                        </div>
                        <div className="col-md-auto">
                            <div className="drop-start btn-dropdown-width-team mt-1 mb-1">
                                <button
                                    name="position"
                                    className="btn dropdown-toggle btn-dropdown-width-team"
                                    id="dropdownMenuButton2"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <span>
                                        {currentPosition
                                            ? currentPosition.name +
                                              ' | ' +
                                              currentPosition.abbr
                                            : ''}
                                    </span>
                                </button>
                                <ul className="dropdown-menu dropdown-content">
                                    <DCPositionItem
                                        position={
                                            currentPosition
                                                ? currentPosition
                                                : ''
                                        }
                                        id={0}
                                        click={SelectPosition}
                                    />
                                    <hr className="dropdown-divider"></hr>
                                    {positions && positions.length > 0
                                        ? positions.map((x, idx) => (
                                              <DCPositionItem
                                                  key={idx}
                                                  position={x}
                                                  id={idx}
                                                  click={SelectPosition}
                                              />
                                          ))
                                        : ''}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="row depth-chart-table mt-1 mb-4">
                        {isMobile ? (
                            <>
                                {currentDepthChartPositions &&
                                    currentDepthChartPositions.length > 0 &&
                                    currentDepthChartPositions.map((x, idx) => {
                                        return (
                                            <DepthChartMobilePlayerRow
                                                canModify={canModify}
                                                key={idx}
                                                player={x}
                                                availablePlayers={
                                                    availablePlayers
                                                }
                                                positionAttributes={
                                                    positionAttributes
                                                }
                                                swapPlayer={SwapPlayer}
                                                isCFB={true}
                                            />
                                        );
                                    })}
                            </>
                        ) : (
                            <table
                                className={`table ${
                                    viewMode === 'dark' ? 'table-dark' : ''
                                }`}
                            >
                                <thead>
                                    <tr>
                                        {positionAttributes &&
                                            positionAttributes.length > 0 &&
                                            positionAttributes.map((x, idx) => {
                                                return (
                                                    <DepthChartHeader
                                                        key={idx}
                                                        idx={idx}
                                                        label={x.label}
                                                        abbr={x.abbr}
                                                        isMobile={isMobile}
                                                    />
                                                );
                                            })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentDepthChartPositions &&
                                        currentDepthChartPositions.length > 0 &&
                                        currentDepthChartPositions.map(
                                            (x, idx) => {
                                                return (
                                                    <DepthChartPlayerRow
                                                        canModify={canModify}
                                                        key={idx}
                                                        player={x}
                                                        availablePlayers={
                                                            availablePlayers
                                                        }
                                                        positionAttributes={
                                                            positionAttributes
                                                        }
                                                        swapPlayer={SwapPlayer}
                                                        isCFB={true}
                                                    />
                                                );
                                            }
                                        )}
                                </tbody>
                            </table>
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
    viewMode: { viewMode }
}) => ({
    currentUser,
    cfbTeam,
    viewMode
});

export default connect(mapStateToProps)(CFBDepthChart);
