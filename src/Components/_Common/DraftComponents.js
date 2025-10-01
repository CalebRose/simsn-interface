import React, { useEffect } from 'react';
import { GetScoutableAttributes } from '../../_Utility/DraftHelper';
import { HeightToFeetAndInches } from '../../_Utility/utilHelper';

export const MobileDraftPick = ({
    currentDraftPick,
    nextDraftPick,
    pick,
    logo
}) => {
    return (
        <>
            <div
                className={`draft-card-mobile card mt-1 mb-1 p-1 ${
                    pick.SelectedPlayerID > 0 && 'border-success'
                } ${
                    currentDraftPick &&
                    currentDraftPick.ID === pick.ID &&
                    'border-danger'
                }  ${
                    nextDraftPick &&
                    nextDraftPick.ID === pick.ID &&
                    'border-warning'
                }`}
            >
                <div className="row">
                    <div className="col-3">
                        <strong className="draft-number me-1">
                            {pick.DraftNumber}
                        </strong>
                        <img className="image-standings-logo" src={logo} />
                    </div>
                    <div className="col-9">
                        <div className="justify-content-start text-start">
                            <label className="draft-pick-text-mobile text-start">
                                {pick.Team}
                                {pick.SelectedPlayerID !== null &&
                                    pick.SelectedPlayerID > 0 && (
                                        <>
                                            {' | '}
                                            {pick.SelectedPlayerPosition}{' '}
                                            {pick.SelectedPlayerName}
                                        </>
                                    )}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export const DesktopDraftPick = ({
    currentDraftPick,
    nextDraftPick,
    pick,
    logo
}) => {
    return (
        <>
            <div
                className={`draft-card card mt-1 mb-2 p-1 ${
                    pick.SelectedPlayerID > 0 && 'border-success'
                } ${
                    currentDraftPick &&
                    currentDraftPick.ID === pick.ID &&
                    'border-danger'
                }  ${
                    nextDraftPick &&
                    nextDraftPick.ID === pick.ID &&
                    'border-warning'
                }`}
            >
                <div className="row g-0">
                    <div className="col-1">
                        <strong className="draft-number">
                            {pick.DraftNumber}
                        </strong>
                    </div>
                    <div className="col-3">
                        <img className="draft-card-icon" src={logo} />
                    </div>
                    <div className="col-8">
                        <div className="card-body">
                            <div className="draft-pick-text">{pick.Team}</div>
                            {pick.SelectedPlayerID !== null &&
                                pick.SelectedPlayerID > 0 && (
                                    <small className="text-small">
                                        {pick.SelectedPlayerPosition}{' '}
                                        {pick.SelectedPlayerName}
                                    </small>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export const WarRoomTab = ({ activeView, setActiveView, warRoomType }) => {
    const isActiveView = activeView === warRoomType;

    return (
        <li className="nav-item">
            <button
                type="button"
                role="tab"
                onClick={() => setActiveView(() => warRoomType)}
                className={`nav-link ${isActiveView ? 'active' : ''}`}
            >
                {warRoomType}
            </button>
        </li>
    );
};

export const WarRoomPick = ({ pick }) => {
    return (
        <div className="col-1">
            <span>
                {pick.Season} Round {pick.DraftRound}, Pick {pick.DraftNumber}
            </span>
        </div>
    );
};

export const DrafteeRow = ({ idx, player, map, draftMap, add, isMobile }) => {
    const [flag, setFlag] = React.useState(false);
    const [lockFlag, setLockFlag] = React.useState(false);
    const keyCode = player.ID;
    useEffect(() => {
        if (map) {
            setFlag(map[keyCode]);
        }
    }, [map, keyCode]);

    useEffect(() => {
        if (draftMap) {
            setLockFlag(() => draftMap[keyCode]);
        }
    }, [draftMap, keyCode]);

    const location = `${player.City}, ${player.State}`;

    const scoutPlayer = () => {
        return add(player);
    };
    return !isMobile ? (
        <>
            <tr className="draftee-row">
                <th scope="row">
                    <h4>{idx + 1}</h4>
                </th>
                <td className="align-middle">
                    <h6>
                        {player.Position}
                        {player.PositionTwo.length > 0
                            ? `/${player.PositionTwo}`
                            : ''}
                    </h6>
                </td>
                <td className="align-middle">
                    {player.FirstName} {player.LastName}
                </td>
                <td className="align-middle">{player.Archetype}</td>
                <td className="align-middle">{player.Age}</td>
                <td className="align-middle">{player.Height}</td>
                <td className="align-middle">{player.Weight}</td>
                <td className="align-middle">{player.College}</td>
                <td className="align-middle">{location}</td>
                <td className="align-middle">{player.OverallGrade}</td>
                <td>
                    {flag ? (
                        <h2>
                            <i className="bi bi-check-circle-fill rounded-circle link-secondary" />
                        </h2>
                    ) : lockFlag ? (
                        <h2>
                            <i className="bi bi-file-lock-fill" />
                        </h2>
                    ) : (
                        <h2>
                            <i
                                className="bi bi-plus-circle-fill rounded-circle link-success"
                                onClick={scoutPlayer}
                            />
                        </h2>
                    )}
                </td>
            </tr>
        </>
    ) : (
        <>
            <div className="card mb-1">
                <div className="card-body">
                    <h5 className="card-title">
                        {player.Position} {player.Archetype} {player.FirstName}{' '}
                        {player.LastName}
                    </h5>
                    <h6 className="card-subtitle mb-2 text-body-secondary">
                        Rank {idx + 1}
                    </h6>
                    <h6 className="card-subtitle mb-2 text-body-secondary">
                        {player.Age} year old from {player.College}
                    </h6>
                    <p className="card-text">Overall: {player.OverallGrade}</p>
                </div>
                <div className="card-body">
                    <div className="btn-group" role="group">
                        {flag ? (
                            <h2>
                                <i className="bi bi-check-circle-fill rounded-circle link-secondary" />
                            </h2>
                        ) : lockFlag ? (
                            <h2>
                                <i className="bi bi-file-lock-fill" />
                            </h2>
                        ) : (
                            <h2>
                                <i
                                    className="bi bi-plus-circle-fill rounded-circle link-success"
                                    onClick={scoutPlayer}
                                />
                            </h2>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export const AttributeColumn = ({
    idx,
    playerIdx,
    attr,
    player,
    profile,
    reveal,
    modalView,
    SpentPoints
}) => {
    const num = idx + 1;
    const attrKey = attr.replace(/\s/g, '');
    const isPotential = attr === 'Potential Grade';
    const gradeKey = `${attrKey}Grade`;
    const showAttributeKey = `ShowAttribute${num}`;
    const showAttribute = isPotential
        ? profile.ShowPotential
        : profile[showAttributeKey];

    const revealAttr = (event) => {
        const { name, value } = event.currentTarget;
        if (name === 'ShowAttribute9' || name === 'ShowAttribute10') {
            return;
        }
        return reveal(playerIdx, profile, name, value);
    };

    return (
        <div className="col-auto">
            <h6>{attr}</h6>
            {!showAttribute ? (
                <button
                    type="button"
                    className="btn btn-small btn-outline-light"
                    onClick={revealAttr}
                    name={isPotential ? 'ShowPotential' : showAttributeKey}
                    value={isPotential ? 10 : 4}
                    disabled={
                        modalView ||
                        (isPotential
                            ? SpentPoints + 10 > 1000
                            : SpentPoints + 4 > 1000)
                    }
                    style={{ fontSize: '1.6vh' }}
                >
                    {isPotential ? '?' : player[gradeKey]}
                </button>
            ) : (
                <p>{isPotential ? player.PotentialGrade : player[attrKey]}</p>
            )}
        </div>
    );
};

export const ScoutPlayerRow = ({
    profile,
    draftedPlayerMap,
    ts,
    remove,
    draft,
    currentDraftPick,
    wr,
    theme,
    reveal,
    setDraftee,
    isMobile,
    playerIdx
}) => {
    const { Draftee } = profile;
    const { TeamID, SpentPoints } = wr;
    const modalTarget = `#drafteeModal`;
    const attrList = GetScoutableAttributes(
        Draftee.Position,
        Draftee.Archetype,
        Draftee.PositionTwo
    );
    const heightObj = HeightToFeetAndInches(Draftee.Height);

    const removePlayerFromBoard = () => {
        return remove(profile);
    };

    const draftPlayer = () => {
        return draft(Draftee);
    };

    const lockPlayer =
        draftedPlayerMap[profile.PlayerID] ||
        (currentDraftPick && currentDraftPick.TeamID !== TeamID) ||
        !ts.IsDraftTime;

    const setModal = () => {
        return setDraftee(() => profile);
    };

    return !isMobile ? (
        <div className="card mb-2">
            <div className="card-body">
                <div className="row">
                    <div className="col-2">
                        <h5 className="card-title mb-1">
                            {Draftee.FirstName} {Draftee.LastName}
                        </h5>
                        <h5 className="card-title mb-1">
                            {Draftee.Position} {Draftee.Archetype}
                        </h5>
                        {Draftee.PositionTwo.length > 0 && (
                            <>
                                <h6 className="card-subtitle mb-1">
                                    {Draftee.PositionTwo} {Draftee.ArchetypeTwo}
                                </h6>
                            </>
                        )}
                        <h6 className="card-subtitle text-body-secondary mb-1">
                            {Draftee.Age} year old player from {Draftee.College}
                        </h6>
                    </div>
                    <div className="col-8">
                        <div className="row">
                            <div className="col-auto">
                                <h6>Height</h6>
                                <p>
                                    {heightObj.feet}' {heightObj.inches}"
                                </p>
                            </div>
                            <div className="col-auto">
                                <h6>Weight</h6>
                                <p>{Draftee.Weight}</p>
                            </div>
                            <div className="col-auto">
                                <div className="align-middle">
                                    <h6>Overall</h6>
                                    <p>{Draftee.OverallGrade}</p>
                                </div>
                            </div>
                            {attrList.map((x, idx) => (
                                <AttributeColumn
                                    idx={idx}
                                    playerIdx={playerIdx}
                                    player={Draftee}
                                    profile={profile}
                                    attr={x}
                                    reveal={reveal}
                                    SpentPoints={SpentPoints}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="col-2">
                        <h6>Options</h6>
                        <div className="btn-group" role="group">
                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-toggle="modal"
                                data-bs-target={modalTarget}
                                onClick={setModal}
                            >
                                <i
                                    className={`bi bi-info-circle ${
                                        theme === 'dark' ? 'text-light' : ''
                                    }`}
                                />
                            </button>
                            <button
                                type="button"
                                className="btn btn-success"
                                disabled={lockPlayer}
                                onClick={draftPlayer}
                            >
                                <i className="bi bi-person-add" />
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={removePlayerFromBoard}
                            >
                                <i className="bi bi-trash" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <>
            <div className="card mb-1">
                <div className="card-body">
                    <h5 className="card-title">
                        {Draftee.FirstName} {Draftee.LastName}
                    </h5>
                    <h6 className="card-subtitle mb-2 text-body-secondary">
                        {Draftee.Age} year old {heightObj.feet}'
                        {heightObj.inches}" {Draftee.Position}
                        {Draftee.PositionTwo.length > 0
                            ? `/${Draftee.PositionTwo}`
                            : ''}{' '}
                        from {Draftee.College}
                    </h6>
                    <div className="row">
                        <p className="card-text">
                            Overall: {Draftee.OverallGrade}
                        </p>
                    </div>
                    <div className="row justify-content-center">
                        {attrList.map((x, idx) => (
                            <AttributeColumn
                                idx={idx}
                                playerIdx={playerIdx}
                                player={Draftee}
                                profile={profile}
                                attr={x}
                                reveal={reveal}
                                SpentPoints={SpentPoints}
                            />
                        ))}
                    </div>
                </div>
                <div className="card-body">
                    <div className="btn-group" role="group">
                        <button
                            type="button"
                            className="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target={modalTarget}
                            onClick={setModal}
                        >
                            <i
                                className={`bi bi-info-circle ${
                                    theme === 'dark' ? 'text-light' : ''
                                }`}
                            />
                        </button>
                        <button
                            type="button"
                            className="btn btn-success"
                            disabled={lockPlayer}
                            onClick={draftPlayer}
                        >
                            <i className="bi bi-person-add" />
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={removePlayerFromBoard}
                        >
                            <i className="bi bi-trash" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
