import React, { useEffect, useState } from 'react';

const MobileRow = ({ data }) => {
    const {
        modalTarget,
        player,
        year,
        cut,
        cutPlayerTitle,
        promiseHelper,
        promiseModalTarget,
        redshirtCount,
        ts,
        view,
        rosterCount,
        healthStatus
    } = data;
    return (
        <div className="card mb-2">
            <div className="card-body">
                <h5
                    className={`card-title ${
                        healthStatus !== 'Healthy' ? 'text-danger' : ''
                    }`}
                >
                    {player.FirstName} {player.LastName}
                </h5>
                <h6 className="card-subtitle mb-2 text-body-secondary">
                    {player.Age} year old {player.Stars} star {player.Position}{' '}
                    from{' '}
                    {player.Country !== 'USA' ? player.Country : player.State}
                </h6>
                <p className="card-text">Overall: {player.OverallGrade}</p>
            </div>
            <ul className="list-group list-group-flush">
                <li className="list-group-item">
                    2pt Shooting: {player.Shooting2Grade} | 3pt Shooting:{' '}
                    {player.Shooting3Grade}
                </li>
                <li className="list-group-item">
                    Finishing: {player.FinishingGrade} | Free Throw:{' '}
                    {player.FreeThrowGrade}
                </li>
                <li className="list-group-item">
                    Rebounding: {player.ReboundingGrade} | Ballwork:{' '}
                    {player.BallworkGrade}
                </li>
                <li className="list-group-item">
                    Int. Defense: {player.InteriorDefenseGrade} | Per. Defense:{' '}
                    {player.PerimeterDefenseGrade}
                </li>
                <li className="list-group-item">
                    Potential: {player.PotentialGrade} | Stamina:{' '}
                    {player.Stamina}
                </li>
                <li className="list-group-item">
                    Min.Expectations: {player.PlaytimeExpectations} | Health:{' '}
                    {healthStatus}
                </li>
            </ul>
            <div className="card-body">
                <div className="btn-group btn-border">
                    {player.IsRedshirting ? (
                        <button type="button" className="btn btn-sm" disabled>
                            <i className="bi bi-check-circle-fill rounded-circle link-danger"></i>
                        </button>
                    ) : redshirtCount < 4 &&
                      !player.IsRedshirt &&
                      (ts.CollegeWeek < 3 || ts.CollegeWeek > 20) &&
                      view ? (
                        <button
                            type="button"
                            className="btn btn-sm"
                            data-bs-toggle="modal"
                            data-bs-target={modalTarget}
                            title="Redshirt Player"
                        >
                            <i className="bi bi-person-fill-lock link-danger"></i>
                        </button>
                    ) : (
                        <button type="button" className="btn btn-sm" disabled>
                            <i
                                className={`bi bi-person-fill ${
                                    player.IsRedshirt
                                        ? 'link-danger'
                                        : 'link-secondary'
                                }`}
                            ></i>
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-sm"
                        onClick={promiseHelper}
                        data-bs-toggle="modal"
                        data-bs-target={promiseModalTarget}
                        disabled={player.TransferStatus < 1 || !view}
                    >
                        <i
                            className={`bi bi-shield-fill ${
                                player.TransferStatus === 1
                                    ? 'link-danger'
                                    : 'link-success'
                            }`}
                        ></i>
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        title={cutPlayerTitle}
                        disabled={
                            rosterCount < 10 ||
                            !view ||
                            (ts.CollegeWeek > 0 && ts.CollegeWeek < 20)
                        }
                        onClick={cut}
                    >
                        <i className="bi bi-scissors" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const DesktopRow = ({ data }) => {
    const {
        modalTarget,
        player,
        year,
        cut,
        cutPlayerTitle,
        promiseHelper,
        promiseModalTarget,
        redshirtCount,
        ts,
        view,
        rosterCount,
        healthStatus
    } = data;
    return (
        <tr>
            <th scope="row" className="align-middle">
                <h6
                    className={`card-title ${
                        healthStatus !== 'Healthy' ? 'text-danger' : ''
                    }`}
                >
                    {player.Position} {player.FirstName} {player.LastName}
                </h6>
            </th>
            <td className="align-middle">{year}</td>
            <td className="align-middle">{player.Height}</td>
            <td className="align-middle">{player.Stars}</td>
            <td className="align-middle">{player.OverallGrade}</td>
            <td className="align-middle">{player.FinishingGrade}</td>
            <td className="align-middle">{player.Shooting2Grade}</td>
            <td className="align-middle">{player.Shooting3Grade}</td>
            <td className="align-middle">{player.FreeThrowGrade}</td>
            <td className="align-middle">{player.BallworkGrade}</td>
            <td className="align-middle">{player.ReboundingGrade}</td>
            <td className="align-middle">{player.InteriorDefenseGrade}</td>
            <td className="align-middle">{player.PerimeterDefenseGrade}</td>
            <td className="align-middle">{player.Stamina}</td>
            <td className="align-middle">{player.PotentialGrade}</td>
            <td className="align-middle">{player.PlaytimeExpectations}</td>
            <td className="align-middle">{healthStatus}</td>
            <td label="redshirt-status" className="align-middle">
                <div className="btn-group btn-border">
                    {player.IsRedshirting ? (
                        <button type="button" className="btn btn-sm" disabled>
                            <i className="bi bi-check-circle-fill rounded-circle link-danger"></i>
                        </button>
                    ) : redshirtCount < 4 &&
                      !player.IsRedshirt &&
                      (ts.CollegeWeek < 3 || ts.CollegeWeek > 20) &&
                      view ? (
                        <button
                            type="button"
                            className="btn btn-sm"
                            data-bs-toggle="modal"
                            data-bs-target={modalTarget}
                            title="Redshirt Player"
                        >
                            <i className="bi bi-person-fill-lock link-danger"></i>
                        </button>
                    ) : (
                        <button type="button" className="btn btn-sm" disabled>
                            <i
                                className={`bi bi-person-fill ${
                                    player.IsRedshirt
                                        ? 'link-danger'
                                        : 'link-secondary'
                                }`}
                            ></i>
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-sm"
                        onClick={promiseHelper}
                        data-bs-toggle="modal"
                        data-bs-target={promiseModalTarget}
                        disabled={player.TransferStatus < 1 || !view}
                    >
                        <i
                            className={`bi bi-shield-fill ${
                                player.TransferStatus === 1
                                    ? 'link-danger'
                                    : 'link-success'
                            }`}
                        ></i>
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        title={cutPlayerTitle}
                        disabled={
                            rosterCount < 10 ||
                            !view ||
                            (ts.CollegeWeek > 0 && ts.CollegeWeek < 20)
                        }
                        onClick={cut}
                    >
                        <i className="bi bi-scissors" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

const BBATeamPlayerRow = (props) => {
    const {
        player,
        idx,
        redshirtCount,
        ts,
        view,
        setPromisePlayer,
        rosterCount,
        isMobile,
        cutPlayer
    } = props;
    let modalTarget = '#redshirtModal' + idx;
    const promiseModalTarget = '#promiseModal';
    const cutPlayerTitle = `Cut ${player.FirstName}`;
    const cut = () => {
        return cutPlayer(player);
    };
    let healthStatus = 'Healthy';
    if (player.IsInjured) {
        healthStatus = `${player.InjuryType} ${player.InjuryName}, ${player.WeeksOfRecovery} Games`;
    }
    // Row Functions
    const getYear = (player) => {
        let isRedshirt = player.IsRedshirt;
        if (player.Year === 5 && isRedshirt) {
            return '(Sr)';
        } else if (player.Year === 4 && !isRedshirt) {
            return 'Sr';
        } else if (player.Year === 4 && isRedshirt) {
            return '(Jr)';
        } else if (player.Year === 3 && !isRedshirt) {
            return 'Jr';
        } else if (player.Year === 3 && isRedshirt) {
            return '(So)';
        } else if (player.Year === 2 && !isRedshirt) {
            return 'So';
        } else if (player.Year === 2 && isRedshirt) {
            return '(Fr)';
        }
        return 'Fr';
    };

    // Row Variables
    let year = getYear(player);

    const promiseHelper = () => {
        return setPromisePlayer(player.PlayerID);
    };

    const data = {
        modalTarget,
        player,
        year,
        cut,
        cutPlayerTitle,
        promiseHelper,
        promiseModalTarget,
        redshirtCount,
        ts,
        view,
        rosterCount,
        healthStatus
    };

    return isMobile ? <MobileRow data={data} /> : <DesktopRow data={data} />;
};

export default BBATeamPlayerRow;
