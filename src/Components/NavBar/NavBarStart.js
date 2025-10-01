import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../../Constants/routes';
import { connect } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { inconspicuousLink } from '../../_Utility/utilHelper';

const NavBar_Start = ({ currentUser, cbb_Timestamp, cfb_Timestamp }) => {
    const user = currentUser;
    const isMobile = useMediaQuery({ query: `(max-width:844px)` });
    const DesktopBarrier = () => {
        return !isMobile ? (
            <li className="nav-item">
                <span className="nav-link">|</span>
            </li>
        ) : (
            ''
        );
    };

    var CFBTeam = () => {
        return (
            <div className="nav-item dropdown">
                <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdownMenuLink"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {user.team}
                </a>
                <ul
                    className="dropdown-menu"
                    aria-labelledby="navbarDropdownMenuLink"
                >
                    <li>
                        <Link to={routes.TEAM} className="dropdown-item">
                            Team Page
                        </Link>
                    </li>
                    <li>
                        <Link to={routes.ROSTER} className="dropdown-item">
                            Roster
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={routes.CFB_GAMEPLAN}
                            className="dropdown-item"
                        >
                            Gameplan
                        </Link>
                    </li>
                    <li>
                        <Link to={routes.DEPTHCHART} className="dropdown-item">
                            Depth Chart
                        </Link>
                    </li>

                    <li>
                        <Link
                            className="dropdown-item"
                            to={routes.CFB_RECRUITING}
                        >
                            Recruiting Overview
                        </Link>
                    </li>

                    <li>
                        <Link
                            to={routes.CFB_TEAM_RECRUITING_BOARD}
                            className="dropdown-item"
                        >
                            {user.team} Recruiting Board
                        </Link>
                    </li>

                    <li>
                        <Link to={routes.CFB_STATS} className="dropdown-item">
                            Statistics
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={routes.CFB_SCHEDULE}
                            className="dropdown-item"
                        >
                            Schedule
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={routes.CFB_TRANSFER}
                            className="dropdown-item"
                        >
                            Transfer Portal
                        </Link>
                    </li>
                </ul>
            </div>
        );
    };

    var NFLTeam = () => {
        return (
            <div className="nav-item dropdown">
                <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdownMenuLink"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {user.NFLTeam}
                </a>
                <ul
                    className="dropdown-menu"
                    aria-labelledby="navbarDropdownMenuLink"
                >
                    <li>
                        <Link to={routes.NFL_ROSTER} className="dropdown-item">
                            Roster
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={routes.NFL_GAMEPLAN}
                            className="dropdown-item"
                        >
                            Gameplan
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={routes.NFL_DEPTHCHART}
                            className="dropdown-item"
                        >
                            Depth Chart
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={routes.NFL_SCHEDULE}
                            className="dropdown-item"
                        >
                            Schedule
                        </Link>
                    </li>
                    <li>
                        <Link to={routes.CFB_STATS} className="dropdown-item">
                            Statistics
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={routes.NFL_FREE_AGENCY}
                            className="dropdown-item"
                        >
                            Free Agency
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={routes.NFL_TRADEBLOCK}
                            className="dropdown-item"
                        >
                            Trade Block
                        </Link>
                    </li>
                    {cfb_Timestamp && (
                        <li>
                            <Link
                                to={routes.NFL_DRAFT_ROOM}
                                className="dropdown-item"
                            >
                                Draft Room
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        );
    };

    const CBBTeam = () => {
        return (
            <div className="nav-item dropdown">
                <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdownMenuLink"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {user.cbb_team}
                </a>
                <ul
                    className="dropdown-menu"
                    aria-labelledby="navbarDropdownMenuLink"
                >
                    <li>
                        <Link to={routes.CBB_TEAM} className="dropdown-item">
                            Team Page
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={routes.CBB_GAMEPLAN}
                            className="dropdown-item"
                        >
                            Gameplan
                        </Link>
                    </li>
                    <li>
                        <Link to={routes.CBB_STATS} className="dropdown-item">
                            Statistics
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={routes.CBB_SCHEDULE}
                            className="dropdown-item"
                        >
                            Schedule
                        </Link>
                    </li>
                    <li>
                        <Link
                            className="dropdown-item"
                            to={routes.CBB_RECRUITING}
                        >
                            CBB Recruiting Overview
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={routes.CBB_RECRUITING_BOARD}
                            className="dropdown-item"
                        >
                            {currentUser.cbb_team} Recruiting Board
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={routes.CBB_TRANSFER}
                            className="dropdown-item"
                        >
                            Transfer Portal
                        </Link>
                    </li>
                </ul>
            </div>
        );
    };

    const NBATeam = () => {
        return (
            <div className="nav-item dropdown">
                <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdownMenuLink"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    {user.NBATeam}
                </a>
                <ul
                    className="dropdown-menu"
                    aria-labelledby="navbarDropdownMenuLink"
                >
                    <li>
                        <Link to={routes.NBA_ROSTER} className="dropdown-item">
                            Team Page
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={routes.NBA_GAMEPLAN}
                            className="dropdown-item"
                        >
                            Gameplan
                        </Link>
                    </li>
                    <li>
                        <Link to={routes.CBB_STATS} className="dropdown-item">
                            Statistics
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={routes.CBB_SCHEDULE}
                            className="dropdown-item"
                        >
                            Schedule
                        </Link>
                    </li>
                    <li>
                        <Link
                            className="dropdown-item"
                            to={routes.NBA_FREE_AGENCY}
                        >
                            Free Agency
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={routes.NBA_TRADEBLOCK}
                            className="dropdown-item"
                        >
                            Trade Block
                        </Link>
                    </li>
                    {cbb_Timestamp && cbb_Timestamp.IsNBAOffseason && (
                        <li>
                            <Link
                                to={routes.NBA_DRAFT_ROOM}
                                className="dropdown-item"
                            >
                                NBA Draft Room
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        );
    };

    const AvailableTeams = () => (
        <div className="nav-item">
            <Link className="nav-link" to={routes.AVAILABLE_TEAMS}>
                <span className="glyphicon glyphicon-open"></span> Request Team
            </Link>
        </div>
    );

    const NewsTab = () => (
        <div className="nav-item">
            <Link className="nav-link" to={routes.NEWS}>
                <span className="glyphicon glyphicon-open" /> News
            </Link>
        </div>
    );
    return (
        <div className="">
            <ul className="navbar-nav">
                <li className="nav-item">
                    {currentUser.team !== null && currentUser.team !== '' ? (
                        <CFBTeam />
                    ) : (
                        <li className="nav-item">
                            <span className="nav-link">CFB (None)</span>
                        </li>
                    )}
                    {/* <TeamTab user={user} username={user.username} teamAbbr={user.teamAbbr} /> */}
                </li>
                <>
                    <DesktopBarrier />
                    <li className="nav-item">
                        {currentUser.NFLTeamID > 0 ? (
                            <NFLTeam />
                        ) : (
                            <span className="nav-link">NFL (None)</span>
                        )}
                    </li>
                </>
                <DesktopBarrier />
                <li className="nav-item">
                    {currentUser.cbb_team !== null &&
                    currentUser.cbb_team !== '' ? (
                        <CBBTeam />
                    ) : (
                        <li className="nav-item">
                            <span className="nav-link">CBB (None)</span>
                        </li>
                    )}
                </li>
                <DesktopBarrier />
                <li className="nav-item">
                    {currentUser.NBATeamID > 0 ? (
                        <NBATeam />
                    ) : (
                        <span className="nav-link">NBA (None)</span>
                    )}
                </li>
                <>
                    <DesktopBarrier />
                    <AvailableTeams />
                    <DesktopBarrier />
                    <NewsTab />
                </>
            </ul>
        </div>
    );
};

const mapStateToProps = ({
    user: { currentUser },
    timestamp: { cbb_Timestamp, cfb_Timestamp }
}) => ({
    currentUser,
    cbb_Timestamp,
    cfb_Timestamp
});

export default connect(mapStateToProps)(NavBar_Start);
