import React, { useEffect, useMemo, useState } from 'react';
import {
    GetCollegeYear,
    GetPromiseMultiplier
} from '../../_Utility/utilHelper';
import { GetMobileCardClass } from '../../Constants/CSSClassHelper';
import { MobileAttribute, MobileInputRow } from '../_Common/MobileAttributeTab';
import { getLogo } from '../../Constants/getLogo';
import { SimCBB, SimCFB } from '../../Constants/CommonConstants';

const CFBOverviewRow = ({
    player,
    rank,
    portalMap,
    timestamp,
    add,
    viewMode,
    setPortalPlayer,
    ds,
    retro,
    theme
}) => {
    if (!player) return;
    const [flag, setFlag] = useState(false);
    const name = `${player.FirstName} ${player.LastName}`;
    const keyCode = `${player.PlayerID}`;
    const previousLogo =
        player && player.PreviousTeamID > 0
            ? getLogo(SimCFB, player.PreviousTeamID, retro)
            : '';
    const newTeamLogo =
        player && player.TeamID > 0
            ? getLogo(SimCFB, player.TeamID, retro)
            : '';
    const portalModalTarget = '#portalPlayerModal';
    const loc = `${player.State}`;
    const mobileClass = GetMobileCardClass(theme);
    useEffect(() => {
        if (portalMap) {
            setFlag(portalMap[keyCode]);
        }
    }, [portalMap, keyCode]);

    const addToProfile = () => {
        if (ds) return;
        setFlag(true);
        return add(player);
    };

    const setPortal = () => {
        return setPortalPlayer(player);
    };

    const leadingTeamsMapper = (p) => {
        // Show list of leading teams
        if (p.LeadingTeams == null || p.LeadingTeams.length === 0)
            return <p className="text-small text-center">No Leading Teams</p>;

        const competingTeams = p.LeadingTeams.filter(
            (x, idx) => idx <= 2 && x.Odds > 0
        );

        if (competingTeams.length === 0)
            return <p className="text-small text-center">No Leading Teams</p>;

        const competingIDs = competingTeams.map((x) => x.TeamID);

        return competingIDs.map((x) => {
            const logo = getLogo(SimCFB, x, retro);
            return (
                <>
                    <img
                        className="image-nfl-fa mx-1"
                        src={logo}
                        alt="competing-team"
                    />
                </>
            );
        });
    };
    // Row Variables
    const year = GetCollegeYear(player);
    const leadingTeams = leadingTeamsMapper(player);
    return (
        <>
            <div className={`${mobileClass} mb-2`}>
                <div className="card-body text-start">
                    <div className="row mb-2">
                        <div className="col-7">
                            <h5>
                                {player.PreviousTeam.length > 0 && (
                                    <img
                                        className="image-recruit-logo"
                                        src={previousLogo}
                                        alt="WinningTeam"
                                    />
                                )}{' '}
                                {name}
                            </h5>
                            <h6 className="card-subtitle mb-2 text-muted">
                                Rank: {rank}{' '}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-info"
                                    data-bs-toggle="modal"
                                    data-bs-target={portalModalTarget}
                                    onClick={setPortal}
                                >
                                    <i
                                        className={`bi bi-info-circle ${
                                            viewMode === 'dark'
                                                ? 'text-light'
                                                : ''
                                        }`}
                                    />
                                </button>
                            </h6>
                            <p className="card-text">
                                {year} Year {player.Stars} star{' '}
                                {player.Position} from {loc}
                            </p>
                        </div>
                        <div className="col-5">
                            <>{leadingTeams}</>
                        </div>
                    </div>
                    <div className="row d-flex mb-3">
                        <MobileAttribute
                            label="Overall"
                            value={player.OverallGrade}
                        />
                        <MobileAttribute
                            label="Potential"
                            value={player.PotentialGrade}
                        />
                    </div>
                    <div className="row justify-content-center">
                        {player.IsSigned ||
                        timestamp.CollegeWeek === 16 ||
                        ds ? (
                            <>
                                <h2 className="mb-1 text-center">
                                    <i className="bi bi-file-lock-fill"></i>
                                </h2>
                                <h6 className="text-center">Locked</h6>
                            </>
                        ) : flag ? (
                            <>
                                <h2 className="mb-1 text-center">
                                    <i className="bi bi-check-circle-fill rounded-circle link-secondary"></i>
                                </h2>
                                <h6 className="text-center">On Board</h6>
                            </>
                        ) : (
                            <>
                                <h2 className="mb-1 text-center">
                                    <i
                                        className="bi bi-plus-circle-fill rounded-circle link-success"
                                        disabled={ds}
                                        onClick={addToProfile}
                                    ></i>
                                </h2>
                                <h6 className="text-center">Add to Board</h6>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

const CBBOverviewRow = ({
    player,
    rank,
    portalMap,
    timestamp,
    add,
    viewMode,
    setPortalPlayer,
    ds,
    retro,
    theme
}) => {
    const [flag, setFlag] = useState(false);
    const name = `${player.FirstName} ${player.LastName}`;
    const keyCode = `${player.PlayerID}`;
    const previousLogo =
        player && player.PreviousTeam.length > 0
            ? getLogo(SimCBB, player.PreviousTeamID, retro)
            : '';
    const newTeamLogo =
        player && player.TeamAbbr.length > 0
            ? getLogo(SimCBB, player.TeamID, retro)
            : '';
    const portalModalTarget = '#portalPlayerModal';
    const loc = player.Country === 'USA' ? player.State : player.Country;
    const mobileClass = GetMobileCardClass(theme);
    useEffect(() => {
        if (portalMap) {
            setFlag(portalMap[keyCode]);
        }
    }, [portalMap, keyCode]);

    const addToProfile = () => {
        if (ds) return;
        setFlag(true);
        return add(player);
    };

    const setPortal = () => {
        return setPortalPlayer(player);
    };

    const leadingTeamsMapper = (p) => {
        // Show list of leading teams
        if (p.LeadingTeams == null || p.LeadingTeams.length === 0)
            return <p className="text-small text-center">No Leading Teams</p>;

        const competingTeams = p.LeadingTeams.filter(
            (x, idx) => idx <= 2 && x.Odds > 0
        );

        if (competingTeams.length === 0)
            return <p className="text-small text-center">No Leading Teams</p>;

        const competingIDs = competingTeams.map((x) => x.TeamID);

        return competingIDs.map((x) => {
            const logo = getLogo(SimCBB, x, retro);
            return (
                <>
                    <img
                        className="image-nfl-fa mx-1"
                        src={logo}
                        alt="competing-team"
                    />
                </>
            );
        });
    };
    // Row Variables
    const year = GetCollegeYear(player);
    const leadingTeams = leadingTeamsMapper(player);
    return (
        <>
            <div className={`${mobileClass} mb-2`}>
                <div className="card-body text-start">
                    <div className="row mb-2">
                        <div className="col-7">
                            <h5>
                                {player.PreviousTeam.length > 0 && (
                                    <img
                                        className="image-recruit-logo"
                                        src={previousLogo}
                                        alt="WinningTeam"
                                    />
                                )}{' '}
                                {name}
                            </h5>
                            <h6 className="card-subtitle mb-2 text-muted">
                                Rank: {rank}{' '}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-info"
                                    data-bs-toggle="modal"
                                    data-bs-target={portalModalTarget}
                                    onClick={setPortal}
                                >
                                    <i
                                        className={`bi bi-info-circle ${
                                            viewMode === 'dark'
                                                ? 'text-light'
                                                : ''
                                        }`}
                                    />
                                </button>
                            </h6>
                            <p className="card-text">
                                {year} Year {player.Stars} star{' '}
                                {player.Position} from {loc}
                            </p>
                        </div>
                        <div className="col-5">
                            <>{leadingTeams}</>
                        </div>
                    </div>
                    <div className="row d-flex mb-3">
                        <MobileAttribute
                            label="Overall"
                            value={player.OverallGrade}
                        />
                        <MobileAttribute
                            label="Finishing"
                            value={player.Finishing}
                        />
                        <MobileAttribute
                            label="2pt Shooting"
                            value={player.Shooting2}
                        />
                        <MobileAttribute
                            label="3pt Shooting"
                            value={player.Shooting3}
                        />
                        <MobileAttribute
                            label="Free Throw"
                            value={player.FreeThrow}
                        />
                        <MobileAttribute
                            label="Ballwork"
                            value={player.Ballwork}
                        />
                        <MobileAttribute
                            label="Rebounding"
                            value={player.Rebounding}
                        />
                        <MobileAttribute
                            label="Int. Defense"
                            value={player.InteriorDefense}
                        />
                        <MobileAttribute
                            label="Per. Defense"
                            value={player.PerimeterDefense}
                        />
                        <MobileAttribute
                            label="Potential"
                            value={player.PotentialGrade}
                        />
                    </div>
                    <div className="row justify-content-center">
                        {player.IsSigned ||
                        timestamp.CollegeWeek === 16 ||
                        ds ? (
                            <>
                                <h2 className="mb-1 text-center">
                                    <i className="bi bi-file-lock-fill"></i>
                                </h2>
                                <h6 className="text-center">Locked</h6>
                            </>
                        ) : flag ? (
                            <>
                                <h2 className="mb-1 text-center">
                                    <i className="bi bi-check-circle-fill rounded-circle link-secondary"></i>
                                </h2>
                                <h6 className="text-center">On Board</h6>
                            </>
                        ) : (
                            <>
                                <h2 className="mb-1 text-center">
                                    <i
                                        className="bi bi-plus-circle-fill rounded-circle link-success"
                                        disabled={ds}
                                        onClick={addToProfile}
                                    ></i>
                                </h2>
                                <h6 className="text-center">Add to Board</h6>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export const TPOverviewMobileRow = ({
    isCFB,
    player,
    rank,
    portalMap,
    timestamp,
    add,
    viewMode,
    setPortalPlayer,
    ds,
    theme,
    retro
}) => {
    return isCFB ? (
        <CFBOverviewRow
            player={player}
            rank={rank}
            portalMap={portalMap}
            timestamp={timestamp}
            add={add}
            viewMode={viewMode}
            retro={retro}
            ds={ds}
            theme={theme}
            setPortalPlayer={setPortalPlayer}
        />
    ) : (
        <CBBOverviewRow
            player={player}
            rank={rank}
            portalMap={portalMap}
            timestamp={timestamp}
            add={add}
            viewMode={viewMode}
            retro={retro}
            ds={ds}
            theme={theme}
            setPortalPlayer={setPortalPlayer}
        />
    );
};

const CFBProfileRow = ({
    profile,
    idx,
    theme,
    allocate,
    viewMode,
    setProfile,
    cancel,
    retro
}) => {
    const { CollegePlayer } = profile;
    const previousLogo =
        CollegePlayer && CollegePlayer.PreviousTeam.length > 0
            ? getLogo(SimCFB, CollegePlayer.PreviousTeamID, retro)
            : '';
    const newTeamLogo =
        CollegePlayer && CollegePlayer.TeamAbbr.length > 0
            ? getLogo(SimCFB, CollegePlayer.TeamID, retro)
            : '';
    const year = GetCollegeYear(CollegePlayer);
    const profileModalTarget = '#promiseModal';
    const loc =
        CollegePlayer.Country === 'USA'
            ? CollegePlayer.State
            : CollegePlayer.Country;
    const promiseMultiplier = useMemo(() => {
        if (profile && profile.Promise) {
            return GetPromiseMultiplier(profile.Promise);
        }
        return 1;
    }, [profile]);

    const leadingTeamsMapper = (data) => {
        if (data.LeadingTeams == null || data.LeadingTeams.length === 0)
            return <p className="text-small text-center">No Leading Teams</p>;

        const competingTeams = data.LeadingTeams.filter(
            (x, idx) => idx <= 2 && x.Odds > 0
        );

        if (competingTeams === null || competingTeams.length === 0) {
            return <p className="text-small text-center">No Leading Teams</p>;
        }

        const competingIDs = competingTeams.map((x) => x.TeamID);
        return competingIDs.map((x) => {
            const logo = getLogo(SimCFB, x, retro);
            return (
                <>
                    <img
                        className="image-nfl-fa mx-1"
                        src={logo}
                        alt="competing-team"
                    />
                </>
            );
        });
    };

    const handleChange = (event) => {
        return allocate(idx, event);
    };

    let leadingTeams = leadingTeamsMapper(CollegePlayer);
    const mobileCardClass = GetMobileCardClass(theme);
    return (
        <>
            <div className={`${mobileCardClass} mb-2`}>
                <div className="card-body text-start">
                    <div className="row mb-2">
                        <div className="col-7">
                            <h5>
                                {CollegePlayer.PreviousTeam.length > 0 && (
                                    <img
                                        className="image-recruit-logo"
                                        src={previousLogo}
                                        alt="WinningTeam"
                                    />
                                )}{' '}
                                {CollegePlayer.FirstName}{' '}
                                {CollegePlayer.LastName}
                            </h5>
                            <h6 className="card-subtitle mb-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-info"
                                    data-bs-toggle="modal"
                                    data-bs-target={profileModalTarget}
                                    onClick={() => setProfile(profile)}
                                >
                                    <i
                                        className={`bi bi-info-circle ${
                                            viewMode === 'dark'
                                                ? 'text-light'
                                                : ''
                                        }`}
                                    />
                                </button>
                            </h6>
                            <p className="card-text">
                                {year} Year {CollegePlayer.Stars} star{' '}
                                {CollegePlayer.Position} from {loc}
                            </p>
                        </div>
                        <div className="col-5">
                            <div className="row mb-2 d-flex justify-content-center">
                                <>{leadingTeams}</>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <MobileAttribute
                                label="Overall"
                                value={CollegePlayer.OverallGrade}
                            />
                            <MobileAttribute
                                label="Potential"
                                value={CollegePlayer.PotentialGrade}
                            />
                            <MobileAttribute
                                label="Promise Multiplier"
                                value={promiseMultiplier}
                            />
                            <MobileInputRow
                                label="Total Points"
                                name="TotalPoints"
                                value={profile.TotalPoints}
                                disable={true}
                            />
                            <MobileInputRow
                                label="Current Points"
                                name="CurrentPoints"
                                change={handleChange}
                                value={profile.CurrentWeeksPoints}
                                disable={profile.LockProfile}
                            />
                        </div>
                        <div className="col d-grid justify-content-center">
                            <button
                                type="button"
                                className="btn card-link btn-sm"
                                onClick={() => cancel(profile)}
                            >
                                <i className="bi bi-x-circle-fill rounded-circle link-danger card-link"></i>
                            </button>
                            <h6 className="text-center">Remove</h6>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const CBBProfileRow = ({
    profile,
    idx,
    theme,
    allocate,
    viewMode,
    setProfile,
    cancel,
    retro
}) => {
    const { CollegePlayer } = profile;
    const previousLogo =
        CollegePlayer && CollegePlayer.PreviousTeam.length > 0
            ? getLogo(SimCBB, CollegePlayer.PreviousTeamID, retro)
            : '';
    const newTeamLogo =
        CollegePlayer && CollegePlayer.TeamAbbr.length > 0
            ? getLogo(SimCBB, CollegePlayer.TeamID, retro)
            : '';
    const year = GetCollegeYear(CollegePlayer);
    const profileModalTarget = '#promiseModal';
    const loc =
        CollegePlayer.Country === 'USA'
            ? CollegePlayer.State
            : CollegePlayer.Country;
    const promiseMultiplier = useMemo(() => {
        if (profile && profile.Promise) {
            return GetPromiseMultiplier(profile.Promise);
        }
        return 1;
    }, [profile]);

    const leadingTeamsMapper = (data) => {
        if (data.LeadingTeams == null || data.LeadingTeams.length === 0)
            return <p className="text-small text-center">No Leading Teams</p>;

        const competingTeams = data.LeadingTeams.filter(
            (x, idx) => idx <= 2 && x.Odds > 0
        );

        if (competingTeams === null || competingTeams.length === 0) {
            return <p className="text-small text-center">No Leading Teams</p>;
        }

        const competingIDs = competingTeams.map((x) => x.TeamID);
        return competingIDs.map((x) => {
            const logo = getLogo(SimCBB, x, retro);
            return (
                <>
                    <img
                        className="image-nfl-fa mx-1"
                        src={logo}
                        alt="competing-team"
                    />
                </>
            );
        });
    };

    const handleChange = (event) => {
        return allocate(idx, event);
    };

    let leadingTeams = leadingTeamsMapper(CollegePlayer);
    const mobileCardClass = GetMobileCardClass(theme);
    return (
        <>
            <div className={`${mobileCardClass} mb-2`}>
                <div className="card-body text-start">
                    <div className="row mb-2">
                        <div className="col-7">
                            <h5>
                                {CollegePlayer.PreviousTeam.length > 0 && (
                                    <img
                                        className="image-recruit-logo"
                                        src={previousLogo}
                                        alt="WinningTeam"
                                    />
                                )}{' '}
                                {CollegePlayer.FirstName}{' '}
                                {CollegePlayer.LastName}
                            </h5>
                            <h6 className="card-subtitle mb-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-info"
                                    data-bs-toggle="modal"
                                    data-bs-target={profileModalTarget}
                                    onClick={() => setProfile(profile)}
                                >
                                    <i
                                        className={`bi bi-info-circle ${
                                            viewMode === 'dark'
                                                ? 'text-light'
                                                : ''
                                        }`}
                                    />
                                </button>
                            </h6>
                            <p className="card-text">
                                {year} Year {CollegePlayer.Stars} star{' '}
                                {CollegePlayer.Position} from {loc}
                            </p>
                        </div>
                        <div className="col-5">
                            <div className="row mb-2 d-flex justify-content-center">
                                <>{leadingTeams}</>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <MobileAttribute
                                label="Overall"
                                value={CollegePlayer.OverallGrade}
                            />
                            <MobileAttribute
                                label="Finishing"
                                value={CollegePlayer.Finishing}
                            />
                            <MobileAttribute
                                label="2pt Shooting"
                                value={CollegePlayer.Shooting2}
                            />
                            <MobileAttribute
                                label="3pt Shooting"
                                value={CollegePlayer.Shooting3}
                            />
                            <MobileAttribute
                                label="Free Throw"
                                value={CollegePlayer.FreeThrow}
                            />
                            <MobileAttribute
                                label="Ballwork"
                                value={CollegePlayer.Ballwork}
                            />
                            <MobileAttribute
                                label="Rebounding"
                                value={CollegePlayer.Rebounding}
                            />
                            <MobileAttribute
                                label="Int. Defense"
                                value={CollegePlayer.InteriorDefense}
                            />
                            <MobileAttribute
                                label="Per. Defense"
                                value={CollegePlayer.PerimeterDefense}
                            />
                            <MobileAttribute
                                label="Potential"
                                value={CollegePlayer.PotentialGrade}
                            />
                            <MobileAttribute
                                label="Promise Multiplier"
                                value={promiseMultiplier}
                            />
                            <MobileInputRow
                                label="Total Points"
                                name="TotalPoints"
                                value={profile.TotalPoints}
                                disable={true}
                            />
                            <MobileInputRow
                                label="Current Points"
                                name="CurrentPoints"
                                change={handleChange}
                                value={profile.CurrentWeeksPoints}
                                disable={profile.LockProfile}
                            />
                        </div>
                        <div className="col d-grid justify-content-center">
                            <button
                                type="button"
                                className="btn card-link btn-sm"
                                onClick={() => cancel(profile)}
                            >
                                <i className="bi bi-x-circle-fill rounded-circle link-danger card-link"></i>
                            </button>
                            <h6 className="text-center">Remove</h6>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export const TPProfileMobileRow = ({
    isCFB,
    profile,
    idx,
    allocate,
    viewMode,
    theme,
    setProfile,
    cancel,
    retro
}) => {
    return isCFB ? (
        <CFBProfileRow
            profile={profile}
            idx={idx}
            allocate={allocate}
            viewMode={viewMode}
            retro={retro}
            theme={theme}
            cancel={cancel}
            setProfile={setProfile}
        />
    ) : (
        <CBBProfileRow
            profile={profile}
            idx={idx}
            allocate={allocate}
            viewMode={viewMode}
            retro={retro}
            theme={theme}
            cancel={cancel}
            setProfile={setProfile}
        />
    );
};
