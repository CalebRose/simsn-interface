import React from 'react';
import { getLogo } from '../../Constants/getLogo';
import { RevealCBBResults, RevealResults } from '../../_Utility/utilHelper';
import { SimCBB, SimNBA } from '../../Constants/CommonConstants';

export const BBAMatchCard = ({ game, team, timestamp, isNBA, retro }) => {
    const currentWeek = !isNBA ? timestamp.CollegeWeek : timestamp.NBAWeek;
    const league = isNBA ? SimNBA : SimCBB;
    const opposingTeam =
        game.HomeTeamID === team.ID ? game.AwayTeam : game.HomeTeam;
    const opposingTeamID =
        game.HomeTeamID === team.ID ? game.AwayTeamID : game.HomeTeamID;
    const opposingCoach =
        game.HomeTeamID === team.ID ? game.AwayTeamCoach : game.HomeTeamCoach;
    const opposingRank =
        game.HomeTeamID === team.ID ? game.AwayRank : game.HomeRank;
    const wonTheMatch =
        game.GameComplete &&
        ((game.HomeTeamID === team.ID && game.HomeTeamWin) ||
            (game.AwayTeamID === team.ID && game.AwayTeamWin));
    const lostTheMatch =
        game.GameComplete &&
        ((game.HomeTeamID === team.ID && game.AwayTeamWin) ||
            (game.AwayTeamID === team.ID && game.HomeTeamWin));
    const awayGame =
        game.HomeTeamID === team.ID || game.IsNeutral ? false : true;
    const opposingTeamLogo = getLogo(league, opposingTeamID, retro);
    const gameWeek = game.Week;
    const ConferenceGame = game.IsConference;
    const ConferenceLabel = team && team.Conference;

    let detailsLabel = '';
    if (game.MatchName.length > 0 || game.MatchName !== '') {
        detailsLabel = game.MatchName;
    } else if (!ConferenceGame) {
        detailsLabel = 'Non-Conference Game';
    } else {
        detailsLabel = `${ConferenceLabel} Conference Game`;
    }

    const showGame = RevealCBBResults(game, timestamp);

    let cardClass = '';
    if (wonTheMatch && (showGame || game.Week < currentWeek)) {
        cardClass = 'card mb-3 text-white bg-success';
    } else if (lostTheMatch && (showGame || game.Week < currentWeek)) {
        cardClass = 'card mb-3 text-white bg-danger';
    } else {
        cardClass = 'card mb-3';
    }

    const cardTitle = `Week ${gameWeek}${game.MatchOfWeek} ${
        awayGame ? 'at ' : 'vs '
    } ${opposingRank > 0 ? `(${opposingRank})` : ''}${opposingTeam}`;

    return (
        <div className={cardClass} style={{ maxWidth: '540px' }}>
            <div className="row g-0">
                <div className="col-md-4 d-flex align-items-center justify-content-center">
                    <img
                        src={opposingTeamLogo}
                        className="img-fluid rounded-start img-lp-match p-1"
                        alt="opposingTeam"
                    />
                </div>
                <div className="col-md-8">
                    <div className="card-body">
                        <h6 className="card-title">{cardTitle}</h6>
                        {(showGame || game.Week < currentWeek) && (
                            <small className="card-text">
                                {game.HomeTeamScore} - {game.AwayTeamScore}
                            </small>
                        )}{' '}
                        <small className="card-text">
                            Location: {game.Stadium} in {game.City},{' '}
                            {game.State}
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};
