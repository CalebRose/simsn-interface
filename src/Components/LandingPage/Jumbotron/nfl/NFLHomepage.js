import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';
import { getLogo } from '../../../../Constants/getLogo';
import routes from '../../../../Constants/routes';
import { setNFLTeam } from '../../../../Redux/nflTeam/nflTeam.actions';
import FBAScheduleService from '../../../../_Services/simFBA/FBAScheduleService';
import FBATeamService from '../../../../_Services/simFBA/FBATeamService';
import { Spinner } from '../../../_Common/Spinner';
import CFBMatchCard from '../cfb/CFBMatchCard';
import NFLStandingsCard from '../../../_Common/NFLStandingsCard';
import FBALandingPageService from '../../../../_Services/simFBA/FBALandingPageService';
import { NewsLogSmall } from '../../../_Common/NewsLog';
import { SimNFL } from '../../../../Constants/CommonConstants';

const NFLHomepage = ({ currentUser, nflTeam, cfb_Timestamp }) => {
    let _teamService = new FBATeamService();
    let _scheduleService = new FBAScheduleService();
    let _landingPageService = new FBALandingPageService();
    const dispatch = useDispatch();
    const [team, setTeam] = React.useState('');
    const [logo, setLogo] = React.useState('');
    const [teamData, setTeamData] = React.useState(null);
    const [teamColors, setTeamColors] = React.useState('');
    const [games, setGames] = React.useState(null);
    const [viewableMatches, setViewableMatches] = React.useState(null);
    const [standings, setStandings] = React.useState([]);
    const [newsFeed, setNewsFeed] = React.useState([]);
    const [viewWidth, setViewWidth] = React.useState(window.innerWidth);
    const isMobile = useMediaQuery({ query: `(max-width:845px)` });

    useEffect(() => {
        if (!viewWidth) {
            setViewWidth(window.innerWidth);
        }
    }, [viewWidth]);

    useEffect(() => {
        if (currentUser) {
            setTeam(currentUser.NFLTeam);
            setLogo(
                getLogo(SimNFL, currentUser.NFLTeamID, currentUser.IsRetro)
            );
        }
        if (!nflTeam) {
            getTeam();
        } else {
            if (!teamData) {
                setTeamData(() => nflTeam);
            }
        }
        if (cfb_Timestamp && nflTeam) {
            GetDivisionStandings();
            GetGames();
            getPersonalizedNewsFeed();
        }
    }, [currentUser, nflTeam, cfb_Timestamp]);

    useEffect(() => {
        if (teamData) {
            const colors = {
                color: '#fff',
                backgroundColor:
                    teamData && teamData.ColorOne
                        ? teamData.ColorOne
                        : '#6c757d',
                borderColor:
                    teamData && teamData.ColorOne
                        ? teamData.ColorOne
                        : '#6c757d'
            };
            setTeamColors(colors);
        }
    }, [teamData]);

    useEffect(() => {
        if (
            cfb_Timestamp &&
            cfb_Timestamp.NFLWeek > -1 &&
            games &&
            games.length > 0
        ) {
            const currentWeek = cfb_Timestamp.NFLWeek;
            let prevWeek = isMobile ? currentWeek - 1 : currentWeek - 2;
            let nextWeek = isMobile ? currentWeek + 1 : currentWeek + 2;
            let prevIdx = 0;
            let nextIdx = 0;
            if (prevWeek < 0) {
                nextWeek = nextWeek - prevWeek;
                prevWeek = 0;
            }
            prevIdx = games.findIndex((x) => x.Week === prevWeek);
            nextIdx = games.findIndex((x) => x.Week === nextWeek);
            while (prevIdx === -1) {
                if (prevWeek > 23) {
                    prevIdx = -2;
                    break;
                }
                prevWeek += 1;
                prevIdx = games.findIndex((x) => x.Week === prevWeek);
            }
            while (nextIdx === -1) {
                nextWeek -= 1;
                nextIdx = games.findIndex((x) => x.Week === nextWeek);
            }

            if (nextIdx === prevIdx && prevIdx === -2) {
                setViewableMatches(() => []);
            } else {
                let gameRange = games.slice(prevIdx, nextIdx + 1);
                gameRange = gameRange.filter(
                    (x) => x.WeekID >= cfb_Timestamp.NFLWeekID
                );

                setViewableMatches(() => gameRange);
            }
        }
    }, [cfb_Timestamp, games]);

    const getTeam = async () => {
        let response = await _teamService.GetNFLTeamByTeamID(
            currentUser.NFLTeamID
        );
        setTeamData(() => response);
        dispatch(setNFLTeam(response));
    };

    const getPersonalizedNewsFeed = async () => {
        let res = await _landingPageService.GetPersonalizedNewsFeed(
            'NFL',
            currentUser.NFLTeamID
        );

        setNewsFeed(() => res);
    };

    const GetDivisionStandings = async () => {
        const res = await _teamService.GetNFLTeamStandingsByDivision(
            nflTeam.DivisionID,
            cfb_Timestamp.NFLSeasonID
        );

        setStandings(() => res);
    };

    const GetGames = async () => {
        const res = await _scheduleService.GetNFLGamesByTeamAndSeason(
            nflTeam.ID,
            cfb_Timestamp.NFLSeasonID
        );

        setGames(() => res);
    };

    return (
        <div>
            <div className="row mt-2">
                <div className="col-auto justify-content-start">
                    <h2>
                        <img
                            className="landing-image"
                            src={logo}
                            alt="Go Cougs"
                        />{' '}
                        {team}
                    </h2>
                </div>
                <div className="col-auto">
                    <h2 className="text-start">
                        {cfb_Timestamp ? cfb_Timestamp.Season : ''}, Week{' '}
                        {cfb_Timestamp !== null &&
                        cfb_Timestamp.NFLWeek !== null
                            ? cfb_Timestamp.NFLWeek
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
                                        to={routes.NFL_ROSTER}
                                        role="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Team
                                    </Link>
                                    <Link
                                        to={routes.NFL_GAMEPLAN}
                                        role="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Gameplan
                                    </Link>
                                    <Link
                                        to={routes.NFL_DEPTHCHART}
                                        role="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Depth Chart
                                    </Link>
                                </div>
                            </div>
                            <div className="row mt-2 mb-2">
                                <div className="btn-group btn-group-sm d-flex">
                                    <Link
                                        to={routes.NFL_FREE_AGENCY}
                                        role="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Free Agency
                                    </Link>
                                    <Link
                                        to={routes.NFL_SCHEDULE}
                                        role="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Schedule
                                    </Link>
                                    <Link
                                        to={routes.CFB_STATS}
                                        role="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Stats
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="row mt-2 mb-2">
                                <div className="btn-group btn-group-sm d-flex">
                                    <Link
                                        to={routes.NFL_ROSTER}
                                        role="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Team
                                    </Link>
                                    <Link
                                        to={routes.NFL_GAMEPLAN}
                                        role="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Gameplan
                                    </Link>
                                    <Link
                                        to={routes.NFL_DEPTHCHART}
                                        role="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Depth Chart
                                    </Link>
                                    <Link
                                        to={routes.NFL_FREE_AGENCY}
                                        role="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Free Agency
                                    </Link>
                                    <Link
                                        to={routes.NFL_SCHEDULE}
                                        role="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Schedule
                                    </Link>
                                    <Link
                                        to={routes.CFB_STATS}
                                        role="button"
                                        className="btn btn-primary btn-md me-2 shadow"
                                    >
                                        Stats
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
                                        team={nflTeam}
                                        timestamp={cfb_Timestamp}
                                        isNFL={true}
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
                <div className="col-md-7 ms-1">
                    <div
                        className={
                            isMobile
                                ? 'row justify-content-start mb-2 mt-2  ms-1'
                                : 'row justify-content-start  ms-1'
                        }
                    >
                        {standings && standings.length > 0 ? (
                            <>
                                <div
                                    className={
                                        isMobile
                                            ? 'mobile-card-viewer'
                                            : 'desktop-display'
                                    }
                                >
                                    <NFLStandingsCard
                                        standings={standings}
                                        retro={currentUser.IsRetro}
                                    />
                                    <div className="nfl-news-feed">
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
        </div>
    );
};

const mapStateToProps = ({
    user: { currentUser },
    nflTeam: { nflTeam },
    timestamp: { cfb_Timestamp }
}) => ({
    currentUser,
    nflTeam,
    cfb_Timestamp
});

export default connect(mapStateToProps)(NFLHomepage);
