import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getLogo } from '../../../../Constants/getLogo';
import routes from '../../../../Constants/routes';
import { setCFBTeam } from '../../../../Redux/cfbTeam/cfbTeam.actions';
import FBAScheduleService from '../../../../_Services/simFBA/FBAScheduleService';
import FBATeamService from '../../../../_Services/simFBA/FBATeamService';
import StandingsCard from '../../../BBA/Schedule/StandingsModalCard';
import { Spinner } from '../../../_Common/Spinner';
import CFBMatchCard from './CFBMatchCard';
import { NewsLogSmall } from '../../../_Common/NewsLog';
import FBALandingPageService from '../../../../_Services/simFBA/FBALandingPageService';
import { SimCFB } from '../../../../Constants/CommonConstants';

const CFBHomepage = ({ currentUser, cfbTeam, cfb_Timestamp }) => {
    let teamService = new FBATeamService();
    let _scheduleService = new FBAScheduleService();
    let _landingPageService = new FBALandingPageService();
    const dispatch = useDispatch();
    const [team, setTeam] = useState('');
    const [logo, setLogo] = useState('');
    const [teamData, setTeamData] = useState(null);
    const [teamColors, setTeamColors] = useState('');
    const [viewableMatches, setViewableMatches] = useState(null);
    const [games, setGames] = useState([]);
    const [standings, setStandings] = useState([]);
    const [newsFeed, setNewsFeed] = useState([]);
    const [viewWidth, setViewWidth] = useState(window.innerWidth);
    const isMobile = useMediaQuery({ query: `(max-width:845px)` });

    const getTeam = async () => {
        let response = await teamService.GetTeamByTeamId(currentUser.teamId);
        setTeamData(response);
        dispatch(setCFBTeam(response));
    };

    const getConferenceStandings = async () => {
        if (!cfbTeam?.ConferenceID || !cfb_Timestamp?.CollegeSeasonID) return;
        const res = await teamService.GetTeamStandingsByConference(
            cfbTeam.ConferenceID,
            cfb_Timestamp.CollegeSeasonID
        );
        setStandings(res);
    };

    const getGames = async () => {
        if (!cfbTeam?.ID || !cfb_Timestamp?.CollegeSeasonID) return;
        const res = await _scheduleService.GetCollegeGamesByTeamAndSeason(
            cfbTeam.ID,
            cfb_Timestamp.CollegeSeasonID
        );
        setGames(res);
    };

    const getPersonalizedNewsFeed = async () => {
        if (!currentUser?.teamId) return;
        const res = await _landingPageService.GetPersonalizedNewsFeed(
            'CFB',
            currentUser.teamId
        );
        setNewsFeed(res);
    };

    const getBread = () => {
        toast(`Here's some bread!`, {
            icon: '🍞'
        });
    };

    // For mobile
    useEffect(() => {
        if (!viewWidth) {
            setViewWidth(window.innerWidth);
        }
    }, [viewWidth, isMobile]);

    // Get Team call
    useEffect(() => {
        if (currentUser) {
            setTeam(currentUser.team);
            setLogo(getLogo(SimCFB, currentUser.teamId, currentUser.IsRetro));
        }
        if (!cfbTeam) getTeam();
        if (cfb_Timestamp && cfbTeam) {
            getConferenceStandings();
            getGames();
            getPersonalizedNewsFeed();
        }
    }, [currentUser, cfbTeam, cfb_Timestamp]);

    useEffect(() => {
        if (!cfb_Timestamp?.CollegeWeek || !games.length) return;
        let currentWeek = cfb_Timestamp.CollegeWeek;
        let prevWeek = isMobile ? currentWeek - 1 : currentWeek - 2;
        let nextWeek = isMobile ? currentWeek + 1 : currentWeek + 2;

        let prevIdx = games.findIndex((x) => x.Week === prevWeek);
        let nextIdx = games.findIndex((x) => x.Week === nextWeek);

        if (prevIdx === -1 && nextIdx === -1) {
            setViewableMatches([]);
            return;
        }
        if (prevIdx === -1 && nextIdx > -1) {
            prevIdx = 0;
        } else if (prevIdx > -1 && nextIdx === -1) {
            nextIdx = games.findIndex((x) => x.Week === currentWeek);
        }
        setViewableMatches(games.slice(prevIdx, nextIdx + 1));
    }, [cfb_Timestamp, games, isMobile]);

    useEffect(() => {
        if (cfbTeam) {
            setTeamColors({
                color: '#fff',
                backgroundColor: cfbTeam.ColorOne || '#6c757d',
                borderColor: cfbTeam.ColorOne || '#6c757d'
            });
        }
    }, [cfbTeam]);

    return (
        <>
            <div className="row mt-2">
                <div className="col-auto justify-content-start">
                    <h2>
                        <img
                            className="landing-image"
                            src={logo}
                            alt="Go Cougs"
                        />
                        {team}
                    </h2>
                </div>
                <div className="col-auto">
                    <h2 className="text-start">
                        {cfb_Timestamp ? cfb_Timestamp.Season : ''}, Week{' '}
                        {cfb_Timestamp !== null &&
                        cfb_Timestamp.CollegeWeek !== null
                            ? cfb_Timestamp.CollegeWeek
                            : ''}
                    </h2>
                </div>
                <div className="col-auto justify-content-start">
                    {teamData && (
                        <h2 className="">
                            {`${teamData.Conference} Conference ${
                                teamData.Division.length > 0
                                    ? `, ${teamData.Division} Division`
                                    : ''
                            }`}
                        </h2>
                    )}
                </div>
            </div>
            <div className="row mt-2">
                <div className="col-md-4">
                    {isMobile ? (
                        <>
                            <div className="row mt-2 mb-2">
                                <div className="btn-group btn-group-sm d-flex">
                                    <Link
                                        to={routes.ROSTER}
                                        role="button"
                                        className="btn btn-primary btn-sm me-2 shadow"
                                    >
                                        Roster
                                    </Link>
                                    <Link
                                        to={routes.CFB_GAMEPLAN}
                                        role="button"
                                        className="btn btn-primary btn-sm me-2 shadow"
                                    >
                                        Gameplan
                                    </Link>
                                    <Link
                                        to={routes.DEPTHCHART}
                                        role="button"
                                        className="btn btn-primary btn-sm me-2 shadow"
                                    >
                                        Depth Chart
                                    </Link>
                                    {cfb_Timestamp &&
                                    cfb_Timestamp.TransferPortalPhase < 2 ? (
                                        <Link
                                            to={routes.CFB_RECRUITING}
                                            type="button"
                                            className="btn btn-primary btn-sm me-2 shadow"
                                        >
                                            Recruit
                                        </Link>
                                    ) : (
                                        <Link
                                            to={routes.CFB_TRANSFER}
                                            type="button"
                                            className="btn btn-primary btn-sm me-2 shadow"
                                        >
                                            Portal
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className="row mt-2 mb-2">
                                <div className="btn-group btn-group-sm d-flex">
                                    <Link
                                        to={routes.CFB_STATS}
                                        type="button"
                                        className="btn btn-primary btn-sm me-2 shadow"
                                    >
                                        Stats
                                    </Link>
                                    <Link
                                        to={routes.CFB_SCHEDULE}
                                        type="button"
                                        className="btn btn-primary btn-sm me-2 shadow"
                                    >
                                        Schedule
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="row mt-2 mb-2">
                                <div className="btn-group btn-group-sm d-flex">
                                    <Link
                                        to={routes.ROSTER}
                                        role="button"
                                        className="btn btn-primary btn-sm me-2 shadow"
                                    >
                                        Roster
                                    </Link>
                                    <Link
                                        to={routes.CFB_GAMEPLAN}
                                        role="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Gameplan
                                    </Link>
                                    <Link
                                        to={routes.DEPTHCHART}
                                        role="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Depth Chart
                                    </Link>
                                    {currentUser &&
                                        currentUser.teamId === 59 && (
                                            <button
                                                type="button"
                                                className="btn btn-small btn-outline-light"
                                                onClick={getBread}
                                            >
                                                🍞
                                            </button>
                                        )}
                                </div>
                            </div>
                            <div className="row mt-2 mb-2">
                                <div className="btn-group btn-group-sm d-flex">
                                    {cfb_Timestamp &&
                                    cfb_Timestamp.TransferPortalPhase < 2 ? (
                                        <Link
                                            to={routes.CFB_RECRUITING}
                                            type="button"
                                            className="btn btn-primary btn-sm me-2 shadow"
                                        >
                                            Recruit
                                        </Link>
                                    ) : (
                                        <Link
                                            to={routes.CFB_TRANSFER}
                                            type="button"
                                            className="btn btn-primary btn-sm me-2 shadow"
                                        >
                                            Portal
                                        </Link>
                                    )}
                                    <Link
                                        to={routes.CFB_STATS}
                                        type="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Statistics
                                    </Link>
                                    <Link
                                        to={routes.CFB_SCHEDULE}
                                        type="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Schedule
                                    </Link>
                                    <Link
                                        to={routes.NEWS}
                                        type="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        News
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                    {viewableMatches && viewableMatches.length > 0 ? (
                        viewableMatches.map((x) => {
                            return (
                                <div className="row landing-page-row">
                                    <CFBMatchCard
                                        game={x}
                                        team={cfbTeam}
                                        isNFL={false}
                                        timestamp={cfb_Timestamp}
                                        retro={currentUser.IsRetro}
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <div className="row landing-page-row">
                            <div className="card text-dark bg-light mb-3">
                                <div className="card-body">
                                    <h5 className="card-title">Loading...</h5>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="col-md-8">
                    <div
                        className={
                            isMobile
                                ? 'row justify-content-start mb-2 mt-2  ms-1'
                                : 'row justify-content-start  ms-1'
                        }
                    >
                        {standings.length > 0 ? (
                            <>
                                <div
                                    className={
                                        isMobile
                                            ? 'mobile-card-viewer'
                                            : 'desktop-display'
                                    }
                                >
                                    <StandingsCard
                                        standings={standings}
                                        league={SimCFB}
                                        retro={currentUser.IsRetro}
                                    />
                                    <div className="cfb-news-feed">
                                        {newsFeed.length > 0 &&
                                            newsFeed.map((x) => (
                                                <NewsLogSmall
                                                    key={x.ID}
                                                    news={x}
                                                    season={
                                                        cfb_Timestamp.Season
                                                    }
                                                />
                                            ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="row justify-content-center pt-2 mt-4 mb-2">
                                <Spinner />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const mapStateToProps = ({
    user: { currentUser },
    cfbTeam: { cfbTeam },
    timestamp: { cfb_Timestamp }
}) => ({
    currentUser,
    cfbTeam,
    cfb_Timestamp
});

export default connect(mapStateToProps)(CFBHomepage);
