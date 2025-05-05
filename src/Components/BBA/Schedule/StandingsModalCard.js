import React, { useEffect } from 'react';
import { StandingsRow } from '../../_Common/NBAStandingsCard';

const StandingsCard = ({ standings, league, retro }) => {
    const [standingsOne, setStandingsOne] = React.useState([]);
    const [standingsTwo, setStandingsTwo] = React.useState([]);

    useEffect(() => {
        if (standings !== undefined || standings !== null) {
            if (standings[0].DivisionID > 0) {
                const division1Standings = standings.filter(
                    (x) => x.DivisionID === standings[0].DivisionID
                );
                const division2Standings = standings.filter(
                    (x) => x.DivisionID !== standings[0].DivisionID
                );
                setStandingsOne(() => division1Standings);
                setStandingsTwo(() => division2Standings);
            } else {
                setStandingsOne(() => standings);
            }
        }
    }, [standings]);

    const Conference =
        standingsOne.length > 0 ? standingsOne[0].ConferenceName : '';

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
            {standingsOne.length > 0 &&
                standingsOne.map((x, idx) => (
                    <StandingsRow
                        key={x.ID}
                        row={x}
                        rank={idx + 1}
                        retro={retro}
                        league={league}
                    />
                ))}
            {standingsTwo.length > 0 && standings[0].DivisionID > 0 ? (
                <>
                    <br />
                    {standingsTwo.map((x, idx) => (
                        <StandingsRow
                            key={x.ID}
                            row={x}
                            rank={idx + 1}
                            retro={retro}
                            league={league}
                        />
                    ))}
                </>
            ) : (
                ''
            )}
        </div>
    );
};

export default StandingsCard;
