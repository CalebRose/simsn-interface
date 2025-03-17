import React, { useEffect, useMemo, useState } from 'react';
import { getLogo } from '../../Constants/getLogo';
import {
    GetCollegeYear,
    GetPromiseMultiplier
} from '../../_Utility/utilHelper';
import { SimCBB, SimCFB } from '../../Constants/CommonConstants';

const CFBOverviewRow = ({
    player,
    key,
    idx,
    rank,
    portalMap,
    timestamp,
    add,
    viewMode,
    ds,
    setPortalPlayer,
    retro
}) => {
    const [flag, setFlag] = useState(false);
    const name = `${player.FirstName} ${player.LastName}`;
    const keyCode = `${player.PlayerID}`;
    const previousLogo =
        player && player.PreviousTeam.length > 0
            ? getLogo(SimCFB, player.PreviousTeamID, retro)
            : '';
    const newTeamLogo =
        player && player.TeamAbbr.length > 0
            ? getLogo(SimCFB, player.TeamID, retro)
            : '';
    const portalModalTarget = '#portalPlayerModal';
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
        return setPortalPlayer(() => player);
    };

    const leadingTeamsMapper = (p) => {
        // Show list of leading teams
        if (p.LeadingTeams == null || p.LeadingTeams.length === 0)
            return 'None';

        const competingTeams = p.LeadingTeams.filter(
            (x, idx) => idx <= 8 && x.Odds > 0
        );

        if (competingTeams.length === 0) return 'None';

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
            <tr>
                <th scope="row">
                    <h4>{rank}</h4>
                </th>
                <td className="align-middle">
                    <h6>{name}</h6>
                    <button
                        type="button"
                        className="btn btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target={portalModalTarget}
                        onClick={setPortal}
                    >
                        <i
                            className={`bi bi-info-circle ${
                                viewMode === 'dark' ? 'text-light' : ''
                            }`}
                        />
                    </button>
                </td>
                <td className="align-middle">
                    <h6>
                        {player.Position}
                        {player.PositionTwo.length > 0
                            ? `/${player.PositionTwo}`
                            : ''}
                    </h6>
                </td>
                <td className="align-middle">
                    <h6>
                        {player.Archetype}
                        {player.ArchetypeTwo.length > 0
                            ? `/${player.ArchetypeTwo}`
                            : ''}
                    </h6>
                </td>
                <td className="align-middle">
                    {player.PreviousTeam.length > 0 && (
                        <>
                            <img
                                className="image-recruit-logo"
                                src={previousLogo}
                                alt="WinningTeam"
                            />
                            <h6>{player.PreviousTeam}</h6>
                        </>
                    )}
                </td>
                <td className="align-middle">
                    <h6>{player.State}</h6>
                </td>
                <td className="align-middle">
                    <h6>{year}</h6>
                </td>
                <td className="align-middle">
                    <h6>{player.Stars}</h6>
                </td>

                <td className="align-middle">
                    <h6>{player.OverallGrade}</h6>
                </td>
                <td className="align-middle">
                    <h6>{player.PotentialGrade}</h6>
                </td>
                <td className="align-middle">
                    {!player.IsSigned ? (
                        <h6>{leadingTeams}</h6>
                    ) : (
                        <img
                            className="image-recruit-logo"
                            src={newTeamLogo}
                            alt="WinningTeam"
                        />
                    )}
                </td>
                <td className="align-middle">
                    {player.IsSigned || timestamp.CollegeWeek === 16 || ds ? (
                        <h2>
                            <i class="bi bi-file-lock-fill"></i>
                        </h2>
                    ) : flag ? (
                        <h2>
                            <i className="bi bi-check-circle-fill rounded-circle link-secondary"></i>
                        </h2>
                    ) : (
                        <h2>
                            <i
                                className="bi bi-plus-circle-fill rounded-circle link-success"
                                onClick={addToProfile}
                            ></i>
                        </h2>
                    )}
                </td>
            </tr>
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
    retro
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
        return setPortalPlayer(() => player);
    };

    const leadingTeamsMapper = (p) => {
        // Show list of leading teams
        if (p.LeadingTeams == null || p.LeadingTeams.length === 0)
            return 'None';

        const competingTeams = p.LeadingTeams.filter(
            (x, idx) => idx <= 2 && x.Odds > 0
        );

        if (competingTeams.length === 0) return 'None';

        const competingIDs = competingTeams.map((x) => x.TeamID);

        return competingIDs.map((x) => {
            console.log({ x });
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
            <tr>
                <th scope="row">
                    <h4>{rank}</h4>
                </th>
                <td className="align-middle">
                    <h6>{name}</h6>
                    <button
                        type="button"
                        className="btn btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target={portalModalTarget}
                        onClick={setPortal}
                    >
                        <i
                            className={`bi bi-info-circle ${
                                viewMode === 'dark' ? 'text-light' : ''
                            }`}
                        />
                    </button>
                </td>
                <td className="align-middle">
                    <h6>{player.Position}</h6>
                </td>
                <td className="align-middle">
                    <h6>{player.Height}</h6>
                </td>
                <td className="align-middle">
                    {player.PreviousTeam.length > 0 && (
                        <>
                            <img
                                className="image-recruit-logo"
                                src={previousLogo}
                                alt="WinningTeam"
                            />
                            <h6>{player.PreviousTeam}</h6>
                        </>
                    )}
                    {player.PreviousTeam.length === 0 && (
                        <p>
                            <strong>Unsigned</strong>
                        </p>
                    )}
                </td>
                <td className="align-middle">
                    <h6>{year}</h6>
                </td>
                <td className="align-middle">
                    <h6>{player.Stars}</h6>
                </td>
                <td className="align-middle">
                    <h6>{player.OverallGrade}</h6>
                </td>
                <td className="align-middle">
                    <h6>{player.Shooting2}</h6>
                </td>
                <td className="align-middle">
                    <h6>{player.Shooting3}</h6>
                </td>
                <td className="align-middle">
                    <h6>{player.FreeThrow}</h6>
                </td>
                <td className="align-middle">
                    <h6>{player.Finishing}</h6>
                </td>
                <td className="align-middle">
                    <h6>{player.Ballwork}</h6>
                </td>
                <td className="align-middle">
                    <h6>{player.Rebounding}</h6>
                </td>
                <td className="align-middle">
                    <h6>{player.InteriorDefense}</h6>
                </td>
                <td className="align-middle">
                    <h6>{player.PerimeterDefense}</h6>
                </td>
                <td className="align-middle">
                    <h6>{player.PotentialGrade}</h6>
                </td>
                <td className="align-middle">
                    {!player.IsSigned ? (
                        <h6>{leadingTeams}</h6>
                    ) : (
                        <img
                            className="image-recruit-logo"
                            src={newTeamLogo}
                            alt="WinningTeam"
                        />
                    )}
                </td>
                <td className="align-middle">
                    {player.IsSigned || timestamp.CollegeWeek === 16 ? (
                        <h2>
                            <i className="bi bi-file-lock-fill"></i>
                        </h2>
                    ) : flag ? (
                        <h2>
                            <i className="bi bi-check-circle-fill rounded-circle link-secondary"></i>
                        </h2>
                    ) : (
                        <h2>
                            <i
                                className="bi bi-plus-circle-fill rounded-circle link-success"
                                onClick={addToProfile}
                            ></i>
                        </h2>
                    )}
                </td>
            </tr>
        </>
    );
};

export const TPOverviewRow = ({
    isCFB,
    player,
    rank,
    portalMap,
    timestamp,
    add,
    viewMode,
    setPortalPlayer,
    ds,
    retro
}) => {
    return isCFB ? (
        <CFBOverviewRow
            isCFB
            player={player}
            rank={rank}
            portalMap={portalMap}
            timestamp={timestamp}
            add={add}
            viewMode={viewMode}
            setPortalPlayer={setPortalPlayer}
            retro={retro}
            ds={ds}
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
            setPortalPlayer={setPortalPlayer}
        />
    );
};

const CFBProfileRow = ({
    profile,
    idx,
    timestamp,
    createPromise,
    removePromise,
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

    const promiseMultiplier = useMemo(() => {
        if (profile && profile.Promise) {
            return GetPromiseMultiplier(profile.Promise);
        }
        return 1;
    }, [profile]);

    const leadingTeamsMapper = (data) => {
        if (data.LeadingTeams == null || data.LeadingTeams.length === 0)
            return 'None';

        const competingTeams = data.LeadingTeams.filter(
            (x, idx) => idx <= 8 && x.Odds > 0
        );

        if (competingTeams === null || competingTeams.length === 0) {
            return 'None';
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

    const removePlayerFromBoard = () => {
        return cancel(profile);
    };

    let leadingTeams = leadingTeamsMapper(CollegePlayer);
    return (
        <>
            <tr>
                <th scope="row" className="align-middle">
                    <h6>{CollegePlayer.Position}</h6>
                </th>
                <th scope="row" className="align-middle">
                    <h6>{CollegePlayer.Archetype}</h6>
                </th>
                <td className="align-middle">
                    <h6
                        className={
                            CollegePlayer.IsCustomCroot ? 'text-primary' : ''
                        }
                    >
                        {CollegePlayer.FirstName} {CollegePlayer.LastName}
                    </h6>
                </td>
                <td className="align-middle">
                    {CollegePlayer.PreviousTeam.length > 0 && (
                        <>
                            <img
                                className="image-recruit-logo"
                                src={previousLogo}
                                alt="WinningTeam"
                            />
                            <h6>{CollegePlayer.PreviousTeam}</h6>
                        </>
                    )}
                    {CollegePlayer.PreviousTeam.length === 0 && (
                        <p>
                            <strong>Unsigned</strong>
                        </p>
                    )}
                </td>
                <td className="align-middle">
                    <h6>{year}</h6>
                </td>
                <td className="align-middle">
                    <h6>{CollegePlayer.Stars}</h6>
                </td>
                <td className="align-middle">
                    <h6>{CollegePlayer.OverallGrade}</h6>
                </td>
                <td className="align-middle">
                    <h6>{CollegePlayer.PotentialGrade}</h6>
                </td>
                <td className="align-middle">
                    {profile.LockProfile ? (
                        <>
                            <img
                                className="image-recruit-logo"
                                src={newTeamLogo}
                                alt="WinningTeam"
                            />
                            <h6>{CollegePlayer.TeamAbbr}</h6>
                        </>
                    ) : (
                        <h6>{leadingTeams}</h6>
                    )}
                </td>
                <td className="align-middle">
                    <input
                        name="CurrentPoints"
                        type="number"
                        class="form-control"
                        id="currentPoints"
                        aria-describedby="currentPoints"
                        disabled={profile.LockProfile}
                        value={profile.CurrentWeeksPoints}
                        onChange={handleChange}
                        min="0"
                    />
                </td>
                <td className="align-middle">{promiseMultiplier}</td>
                <td className="align-middle">
                    <h6>{profile.TotalPoints}</h6>
                </td>
                <td className="align-middle">
                    <div className="btn-group" role="group">
                        <button
                            type="button"
                            className="btn btn-sm btn-info"
                            data-bs-toggle="modal"
                            data-bs-target={profileModalTarget}
                            onClick={() => setProfile(() => profile)}
                        >
                            <i
                                className={`bi bi-info-circle ${
                                    viewMode === 'dark' ? 'text-light' : ''
                                }`}
                            />
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={removePlayerFromBoard}
                        >
                            <i className="bi bi-x-circle-fill rounded-circle" />
                        </button>
                    </div>
                </td>
            </tr>
        </>
    );
};

const CBBProfileRow = ({
    profile,
    idx,
    timestamp,
    createPromise,
    removePromise,
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
        CollegePlayer && CollegePlayer.TeamID > 0
            ? getLogo(SimCBB, CollegePlayer.TeamID, retro)
            : '';
    const year = GetCollegeYear(CollegePlayer);
    const profileModalTarget = '#promiseModal';

    const promiseMultiplier = useMemo(() => {
        if (profile && profile.Promise) {
            return GetPromiseMultiplier(profile.Promise);
        }
        return 1;
    }, [profile]);

    const leadingTeamsMapper = (data) => {
        if (data.LeadingTeams == null || data.LeadingTeams.length === 0)
            return 'None';

        const competingTeams = data.LeadingTeams.filter(
            (x, idx) => idx <= 2 && x.Odds > 0
        );

        if (competingTeams === null || competingTeams.length === 0) {
            return 'None';
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

    const removePlayerFromBoard = () => {
        return cancel(profile);
    };

    let leadingTeams = leadingTeamsMapper(CollegePlayer);

    return (
        <>
            <tr>
                <th scope="row" className="align-middle">
                    <h6>{CollegePlayer.Position}</h6>
                </th>
                <td className="align-middle">
                    <h6
                        className={
                            CollegePlayer.IsCustomCroot ? 'text-primary' : ''
                        }
                    >
                        {CollegePlayer.FirstName} {CollegePlayer.LastName}
                    </h6>
                </td>
                <td className="align-middle">
                    {CollegePlayer.PreviousTeam.length > 0 && (
                        <>
                            <img
                                className="image-recruit-logo"
                                src={previousLogo}
                                alt="WinningTeam"
                            />
                            <h6>{CollegePlayer.PreviousTeam}</h6>
                        </>
                    )}
                </td>
                <td className="align-middle">
                    <h6>{year}</h6>
                </td>
                <td className="align-middle">
                    <h6>{CollegePlayer.Stars}</h6>
                </td>
                <td className="align-middle">
                    <h6>{CollegePlayer.OverallGrade}</h6>
                </td>
                <td className="align-middle">
                    <h6>{CollegePlayer.Shooting2}</h6>
                </td>
                <td className="align-middle">
                    <h6>{CollegePlayer.Shooting3}</h6>
                </td>
                <td className="align-middle">
                    <h6>{CollegePlayer.FreeThrow}</h6>
                </td>
                <td className="align-middle">
                    <h6>{CollegePlayer.Finishing}</h6>
                </td>
                <td className="align-middle">
                    <h6>{CollegePlayer.Ballwork}</h6>
                </td>
                <td className="align-middle">
                    <h6>{CollegePlayer.Rebounding}</h6>
                </td>
                <td className="align-middle">
                    <h6>{CollegePlayer.InteriorDefense}</h6>
                </td>
                <td className="align-middle">
                    <h6>{CollegePlayer.PerimeterDefense}</h6>
                </td>
                <td className="align-middle">
                    <h6>{CollegePlayer.PotentialGrade}</h6>
                </td>
                <td className="align-middle">
                    {profile.LockProfile ? (
                        <>
                            <img
                                className="image-recruit-logo"
                                src={newTeamLogo}
                                alt="WinningTeam"
                            />
                            <h6>{CollegePlayer.TeamAbbr}</h6>
                        </>
                    ) : (
                        <h6>{leadingTeams}</h6>
                    )}
                </td>
                <td className="align-middle">
                    <input
                        name="CurrentPoints"
                        type="number"
                        class="form-control"
                        id="currentPoints"
                        aria-describedby="currentPoints"
                        disabled={profile.LockProfile}
                        value={profile.CurrentWeeksPoints}
                        onChange={handleChange}
                        min="0"
                    />
                </td>
                <td className="align-middle">{promiseMultiplier}</td>
                <td className="align-middle">
                    <h6>{profile.TotalPoints}</h6>
                </td>
                <td className="align-middle">
                    <div className="btn-group" role="group">
                        <button
                            type="button"
                            className="btn btn-sm btn-info"
                            data-bs-toggle="modal"
                            data-bs-target={profileModalTarget}
                            onClick={() => setProfile(() => profile)}
                        >
                            <i
                                className={`bi bi-info-circle ${
                                    viewMode === 'dark' ? 'text-light' : ''
                                }`}
                            />
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={removePlayerFromBoard}
                        >
                            <i className="bi bi-x-circle-fill rounded-circle" />
                        </button>
                    </div>
                </td>
            </tr>
        </>
    );
};

export const TPProfileRow = ({
    isCFB,
    profile,
    idx,
    timestamp,
    createPromise,
    removePromise,
    allocate,
    viewMode,
    setProfile,
    cancel,
    retro
}) => {
    return isCFB ? (
        <CFBProfileRow
            isCFB
            idx={idx}
            profile={profile}
            timestamp={timestamp}
            createPromise={createPromise}
            removePromise={removePromise}
            allocate={allocate}
            viewMode={viewMode}
            retro={retro}
            setProfile={setProfile}
            cancel={cancel}
        />
    ) : (
        <CBBProfileRow
            profile={profile}
            idx={idx}
            timestamp={timestamp}
            createPromise={createPromise}
            removePromise={removePromise}
            allocate={allocate}
            viewMode={viewMode}
            retro={retro}
            cancel={cancel}
            setProfile={setProfile}
        />
    );
};
