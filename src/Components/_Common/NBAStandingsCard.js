import React from 'react';
import { getLogo } from '../../Constants/getLogo';

export const StandingsRow = ({ league, row, rank, retro }) => {
    const logo = getLogo(league, row.TeamID, retro);
    return (
        <div key={row.ID} className="row mb-2" style={{ height: '30px' }}>
            <div className="col" style={{ width: '50px' }}>
                {rank}
            </div>
            <div className="col" style={{ width: '50px' }}>
                <img className="image-standings-logo" src={logo} />
            </div>
            <div className="col" style={{ width: '50px' }}>
                {row.ConferenceWins}
            </div>
            <div className="col" style={{ width: '50px' }}>
                {row.ConferenceLosses}
            </div>
            <div className="col" style={{ width: '50px' }}>
                {row.TotalWins}
            </div>
            <div className="col" style={{ width: '50px' }}>
                {row.TotalLosses}
            </div>
        </div>
    );
};

export const NBAStandingsCard = ({ league, standings, retro }) => {
    const Conference = standings.length > 0 ? standings[0].ConferenceName : '';

    return (
        <div className="d-flex flex-column standings-container me-1 p-2 border rounded">
            <div className="row">
                <h6>{Conference} Standings</h6>
            </div>
            <div className="row">
                <div className="col">Rank</div>
                <div className="col">Team</div>
                <div className="col" title="Conference Wins">
                    C.W.
                </div>
                <div className="col" title="Conference Losses">
                    C.L.
                </div>
                <div className="col" title="Total Wins">
                    T.W.
                </div>
                <div className="col" title="Total Losses">
                    T.L.
                </div>
            </div>
            {standings.length > 0 &&
                standings.map((x, idx) => (
                    <StandingsRow
                        row={x}
                        rank={idx + 1}
                        retro={retro}
                        league={league}
                    />
                ))}
        </div>
    );
};
