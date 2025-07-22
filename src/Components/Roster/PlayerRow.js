import React from 'react';
import { GetOverall, GetYear, SetPriority } from '../../_Utility/RosterHelper';
import { HeightToFeetAndInches } from '../../_Utility/utilHelper';

const PlayerRow = (props) => {
    const {
        idx,
        redshirtCount,
        ts,
        view,
        theme,
        setPromisePlayer,
        data,
        rosterCount,
        cutPlayer
    } = props;
    let modalTarget = '#redshirtModal' + idx;
    const playerTarget = '#playerModal' + idx;
    const promiseModalTarget = '#promiseModal';
    const cutPlayerTitle = `Cut ${data.FirstName}`;

    let ovr = GetOverall(data.Overall, data.Year);
    const year = GetYear(data);
    const heightObj = HeightToFeetAndInches(data.Height);
    let healthStatus = 'Healthy';
    if (data.IsInjured) {
        healthStatus = `${data.InjuryType} ${data.InjuryName}, ${data.WeeksOfRecovery} Games`;
    }
    const cut = () => {
        return cutPlayer(data);
    };
    const promiseHelper = () => {
        return setPromisePlayer(data.PlayerID);
    };
    return (
        <tr>
            <th
                className={`align-middle ${
                    data.IsInjured ? 'text-danger' : ''
                }`}
            >
                {props.data.FirstName + ' ' + props.data.LastName}
                <button
                    type="button"
                    className="btn btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target={playerTarget}
                >
                    <i
                        className={`bi bi-info-circle ${
                            theme === 'dark' ? 'text-light' : ''
                        }`}
                    />
                </button>
            </th>
            <td label="Archtype">{data.Archetype}</td>
            <td label="Position">
                {data.Position}
                {data.PositionTwo.length > 0 ? `/${data.PositionTwo}` : ''}
            </td>
            <td label="Overall">{ovr ? ovr : ''}</td>
            <td label="Year">{year ? year : ''}</td>
            <td label="Height">
                {heightObj.feet}' {heightObj.inches}"
            </td>
            <td label="Weight">{data.Weight}</td>
            <td label="State">{data.State}</td>
            <td label="Stars">{data.Stars}</td>
            <td label="Potential">{data.PotentialGrade}</td>
            <td label="Health">
                <p className="text-small">{healthStatus}</p>
            </td>
            <td label="">
                <div className="btn-group btn-border">
                    {data.IsRedshirting ? (
                        <button type="button" className="btn btn-sm" disabled>
                            <i className="bi bi-check-circle-fill rounded-circle link-danger"></i>
                        </button>
                    ) : redshirtCount < 20 &&
                      !data.IsRedshirt &&
                      ts.CollegeWeek < 5 &&
                      !ts.CFBSpringGames &&
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
                                    data.IsRedshirt
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
                        disabled={data.TransferStatus < 1 || !view}
                    >
                        <i
                            className={`bi bi-shield-fill ${
                                data.TransferStatus === 1
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
                            !view || (ts.CollegeWeek > 0 && ts.CollegeWeek < 21)
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

export default PlayerRow;
