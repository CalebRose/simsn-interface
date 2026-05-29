import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import constants from '../../Constants/acronyms';
import CBBHomePage from './Jumbotron/cbb/CBBHomepage';
import CFBHomepage from './Jumbotron/cfb/CFBHomepage';
import NBAHomepage from './Jumbotron/nba/NBAHomepage';
import NFLHomepage from './Jumbotron/nfl/NFLHomepage';
import { setNFLTeam } from '../../Redux/nflTeam/nflTeam.actions';
import { setCBBTeam } from '../../Redux/cbbTeam/cbbTeam.actions';
import { setNBATeam } from '../../Redux/nbaTeam/nbaTeam.actions';
import BBATeamService from '../../_Services/simNBA/BBATeamService';
import FBATeamService from '../../_Services/simFBA/FBATeamService';
import AdminService from '../../_Services/simFBA/AdminService';
import { getLogo } from '../../Constants/getLogo';
import {
    setCBBNotifications,
    setCFBNotifications,
    setNBANotifications,
    setNFLNotifications
} from '../../Redux/inbox/inbox.actions';
import {
    SimCBB,
    SimCFB,
    SimNBA,
    SimNFL
} from '../../Constants/CommonConstants';

const LandingPage = ({ currentUser, nflTeam, cbbTeam, nbaTeam, inbox }) => {
    let _teamService = new BBATeamService();
    let teamService = new FBATeamService();
    const _adminService = new AdminService();
    const [sport, setSport] = useState('');
    const [viewWidth, setViewWidth] = useState(window.innerWidth);
    const isMobile = useMediaQuery({ query: `(max-width:845px)` });
    const dispatch = useDispatch();
    const [cfbLogo, setCFBLogo] = useState('');
    const [nflLogo, setNFLLogo] = useState('');
    const [cbbLogo, setCBBLogo] = useState('');
    const [nbaLogo, setNBALogo] = useState('');

    // For mobile
    React.useEffect(() => {
        if (!viewWidth) {
            setViewWidth(window.innerWidth);
        }
    }, [viewWidth]);

    const selectSport = (event) => {
        setSport(event.target.value);
    };

    useEffect(() => {
        if (currentUser && currentUser.teamId && currentUser.teamId > 0) {
            const logo = getLogo(
                SimCFB,
                currentUser.teamId,
                currentUser.IsRetro
            );
            setCFBLogo(() => logo);
            setSport(SimCFB);
        } else if (currentUser && currentUser.NFLTeamID) {
            setSport(SimNFL);
        } else if (currentUser && currentUser.cbb_id) {
            setSport(SimCBB);
        } else if (currentUser && currentUser.nba_id) {
            setSport(SimNBA);
        } else {
            setSport('');
        }
    }, [
        currentUser?.teamId,
        currentUser?.NFLTeamID,
        currentUser?.cbb_id,
        currentUser?.nba_id
    ]);

    useEffect(() => {
        if (currentUser?.teamId > 0 && !inbox) {
            getFBAInbox();
        }
    }, [currentUser?.teamId, currentUser?.NFLTeamID, inbox]);

    useEffect(() => {
        if (currentUser?.NFLTeamID > 0 && !nflTeam) {
            GetNFLTeam();
        }
    }, [currentUser?.NFLTeamID, nflTeam]);

    useEffect(() => {
        if (currentUser?.cbb_id > 0 && !cbbTeam) {
            GetCBBTeam();
        }
    }, [currentUser?.cbb_id, cbbTeam]);

    useEffect(() => {
        if (currentUser?.NBATeamID > 0 && !nbaTeam) {
            GetNBATeam();
        }
    }, [currentUser?.NBATeamID, cbbTeam]);

    useEffect(() => {
        if (
            currentUser &&
            (currentUser.cbb_id > 0 || currentUser.NBATeamID > 0) &&
            !inbox
        ) {
            getBBAInbox();
        }
    }, [currentUser?.cbb_id, currentUser?.NBATeamID, inbox]);

    const GetCBBTeam = async () => {
        let response = await _teamService.GetTeamByTeamId(currentUser.cbb_id);
        const logo = getLogo(SimCBB, currentUser.cbb_id, currentUser.IsRetro);
        setCBBLogo(() => logo);
        dispatch(setCBBTeam(response));
    };

    const GetNFLTeam = async () => {
        let response = await teamService.GetNFLTeamByTeamID(
            currentUser.NFLTeamID
        );
        const logo = getLogo(
            SimNFL,
            currentUser.NFLTeamID,
            currentUser.IsRetro
        );
        setNFLLogo(() => logo);
        dispatch(setNFLTeam(response));
    };

    const GetNBATeam = async () => {
        let response = await _teamService.GetNBATeamByTeamID(
            currentUser.NBATeamID
        );
        const logo = getLogo(
            SimNBA,
            currentUser.NBATeamID,
            currentUser.IsRetro
        );
        setNBALogo(() => logo);
        dispatch(setNBATeam(response));
    };

    const getFBAInbox = async () => {
        const collegeID = currentUser.teamId || 0;
        const profID = currentUser.NFLTeamID || 0;
        const res = await _adminService.GetInbox('fba', collegeID, profID);

        dispatch(setCFBNotifications(res.CFBNotifications));
        dispatch(setNFLNotifications(res.NFLNotifications));
    };

    const getBBAInbox = async () => {
        const collegeID = currentUser.cbb_id || 0;
        const profID = currentUser.NBATeamID || 0;
        const res = await _adminService.GetInbox('bba', collegeID, profID);
        dispatch(setCBBNotifications(res.CBBNotifications));
        dispatch(setNBANotifications(res.NBANotifications));
    };

    return (
        <div className="container-fluid">
            <div
                className={`row mt-3 justify-content-${
                    !isMobile ? 'start' : 'center'
                }`}
            >
                {isMobile ? (
                    <div className="row">
                        <div className="btn-group-sm btn-group d-flex">
                            <button
                                type="button"
                                className="btn btn-outline-light btn-sm mb-2 btn-mobile"
                            >
                                <a
                                    href="https://calebrose.io/simsn-interface-v2/"
                                    target="_blank"
                                >
                                    Interface 2.0
                                </a>
                            </button>
                            {currentUser && currentUser.teamId && (
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm mb-2 btn-mobile"
                                    value="CFB"
                                    onClick={selectSport}
                                >
                                    <img
                                        className="image-standings-logo"
                                        src={cfbLogo}
                                    />{' '}
                                    SimCFB
                                </button>
                            )}
                            {currentUser && currentUser.NFLTeamID && (
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm mb-2 btn-mobile"
                                    value="NFL"
                                    onClick={selectSport}
                                >
                                    <img
                                        className="image-standings-logo"
                                        src={nflLogo}
                                    />{' '}
                                    SimNFL
                                </button>
                            )}
                            {currentUser && currentUser.cbb_id && (
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm mb-2 btn-mobile"
                                    value="CBB"
                                    onClick={selectSport}
                                >
                                    <img
                                        className="image-standings-logo"
                                        src={cbbLogo}
                                    />{' '}
                                    SimCBB
                                </button>
                            )}
                            {currentUser && currentUser.NBATeamID && (
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm btn-mobile"
                                    value="NBA"
                                    onClick={selectSport}
                                >
                                    <img
                                        className="image-standings-logo"
                                        src={nbaLogo}
                                    />{' '}
                                    SimNBA
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="col-1">
                        <div className="btn-group-sm btn-group-vertical d-flex">
                            <a
                                href="https://calebrose.io/simsn-interface-v2/"
                                target="_blank"
                            >
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm mb-2 btn-mobile"
                                >
                                    Interface 2.0
                                </button>
                            </a>

                            {currentUser && currentUser.teamId && (
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm mb-2"
                                    value={SimCFB}
                                    onClick={selectSport}
                                >
                                    <img
                                        className="image-standings-logo"
                                        src={cfbLogo}
                                    />{' '}
                                    SimCFB
                                </button>
                            )}
                            {currentUser && currentUser.NFLTeamID && (
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm mb-2"
                                    value={SimNFL}
                                    onClick={selectSport}
                                >
                                    <img
                                        className="image-standings-logo"
                                        src={nflLogo}
                                    />{' '}
                                    SimNFL
                                </button>
                            )}
                            {currentUser && currentUser.cbb_id && (
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm mb-2"
                                    value={SimCBB}
                                    onClick={selectSport}
                                >
                                    <img
                                        className="image-standings-logo"
                                        src={cbbLogo}
                                    />{' '}
                                    SimCBB
                                </button>
                            )}
                            {currentUser && currentUser.NBATeamID && (
                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-sm"
                                    value={SimNBA}
                                    onClick={selectSport}
                                >
                                    <img
                                        className="image-standings-logo"
                                        src={nbaLogo}
                                    />{' '}
                                    SimNBA
                                </button>
                            )}
                        </div>
                    </div>
                )}
                <div className={isMobile ? 'col-sm-12' : 'col-sm-11'}>
                    {currentUser && sport === SimCBB ? (
                        <CBBHomePage />
                    ) : currentUser && sport === SimNBA ? (
                        <NBAHomepage />
                    ) : currentUser && sport === SimCFB ? (
                        <CFBHomepage />
                    ) : currentUser && sport === SimNFL ? (
                        <NFLHomepage />
                    ) : (
                        'No Team? Click the Available Teams button'
                    )}
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = ({
    user: { currentUser },
    nbaTeam: { nbaTeam },
    cbbTeam: { cbbTeam },
    cfbTeam: { cfbTeam },
    nflTeam: { nflTeam },
    inbox: inbox
}) => ({
    currentUser,
    nbaTeam,
    cbbTeam,
    cfbTeam,
    nflTeam,
    inbox
});

export default connect(mapStateToProps)(LandingPage);
