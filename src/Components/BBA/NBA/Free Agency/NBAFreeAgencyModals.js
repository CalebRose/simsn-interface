import React, { useEffect, useState } from 'react';
import { GetModalClass } from '../../../../Constants/CSSClassHelper';
import { getLogo } from '../../../../Constants/getLogo';
import {
    RoundToTwoDecimals,
    ShuffleList
} from '../../../../_Utility/utilHelper';
import {
    GetMaxPercentage,
    GetNBACapSpace,
    GetTotalValue,
    ValidateNBARule1,
    ValidateNBARule2,
    ValidateNBARule3,
    ValidateNBARule4,
    ValidateNBARule5
} from '../../../NFL/FreeAgency/FreeAgencyHelper';
import {
    OfferInput,
    TotalInput
} from '../../../NFL/FreeAgency/FreeAgencyOfferInput';
import { SwitchToggle } from '../../../_Common/SwitchToggle';
import { BBAStatsRow } from '../../../_Common/SeasonStatsRow';
import { SimNBA } from '../../../../Constants/CommonConstants';

export const NBAFreeAgencyPlayerModal = ({ player, idx, theme, retro }) => {
    const modalId = 'playerModal' + idx;

    const AllOffers = player && player.Offers;
    const { SeasonStats } = player;
    const teamsList = AllOffers && AllOffers.map((x) => x.Team);
    const shuffledTeamList = teamsList && ShuffleList(teamsList);
    const modalClass = GetModalClass(theme);

    const OfferingTeam = ({ offer, idx }) => {
        const logo = getLogo(SimNBA, offer.TeamID, retro);
        const rank = idx + 1;
        return (
            <div className="row">
                <div className="col">
                    <img src={logo} className="image-nfl-player-modal" alt="" />
                </div>
                <div className="col">
                    <h6>Rank: {rank}</h6>
                </div>
                <div className="col">
                    <h6>
                        Contract Value: $
                        {RoundToTwoDecimals(offer.ContractValue)}
                    </h6>
                </div>
            </div>
        );
    };

    return (
        <div
            className="modal fade"
            id={modalId}
            tabIndex="-1"
            aria-labelledby="extendPlayerModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-lg">
                <div className={modalClass}>
                    <div className="modal-header">
                        <h4 className="modal-title" id="playerModalLabel">
                            {player.Position} {player.FirstName}{' '}
                            {player.LastName}
                        </h4>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="row g-2 gy-2 mb-2">
                            <div className="col">
                                <h5>Age | Exp</h5>
                                {player.Age} | {player.Year}
                            </div>
                            <div className="col">
                                <h5>Previous Team</h5>
                                {player.PreviousTeam.length > 0
                                    ? player.PreviousTeam
                                    : 'N/A'}
                            </div>
                            <div className="col">
                                <h5>
                                    Drafted By:{' '}
                                    {player.DraftedTeamAbbr.length > 0
                                        ? player.DraftedTeamAbbr
                                        : 'N/A'}
                                </h5>
                            </div>
                            <div className="col">
                                <h5>Status: </h5>
                                {player.IsAcceptingOffers
                                    ? 'Open'
                                    : 'Negotiating'}
                            </div>
                        </div>
                        <div className="row g-2 gy-2 mb-3">
                            <div className="col">
                                <h5>Overall:</h5> {player.Overall}
                            </div>
                            <div className="col">
                                <h5>Potential:</h5> {player.PotentialGrade}
                            </div>
                            <div className="col">
                                <h5>Height:</h5> {player.Height}
                            </div>
                            <div className="col">
                                <h5>Archetype:</h5> {player.Archetype}
                            </div>
                        </div>
                        <div className="row g-2 mb-3">
                            <div className="col">
                                <h5>Work Ethic</h5>
                                <p>{player.WorkEthic}</p>
                            </div>
                            <div className="col">
                                <h5>Free Agency Bias</h5>
                                <p>{player.FreeAgency}</p>
                            </div>
                            <div className="col">
                                <h5>Personality</h5>
                                <p>{player.Personality}</p>
                            </div>
                            <div className="col">
                                <h5>Region</h5>
                                {player.Country === 'USA'
                                    ? `${player.State}, ${player.Country}`
                                    : player.Country}
                            </div>
                            <div className="col">
                                <h5>Free Agency</h5>
                                {player.IsFreeAgent
                                    ? 'Free Agent'
                                    : 'Waiver Player'}
                            </div>
                        </div>
                        {player &&
                            !player.IsNegotiating &&
                            AllOffers !== null &&
                            AllOffers.length > 0 && (
                                <div className="row g-1 mb-3">
                                    <h5>Offers</h5>
                                    {AllOffers.map((x, i) => {
                                        return (
                                            <OfferingTeam offer={x} idx={i} />
                                        );
                                    })}
                                </div>
                            )}
                        {player && player.IsNegotiating && (
                            <div className="row g-1 mb-3">
                                <h5>This player is now negotiating.</h5>
                                <p>
                                    Teams with an offer will have one more week
                                    to update their offers before the player
                                    signs. Until then, all contract info will
                                    remain hidden.
                                </p>
                                <h6>Teams Negotiating</h6>
                                {shuffledTeamList.map((x) => (
                                    <p>{x}</p>
                                ))}
                            </div>
                        )}
                        <div className="row">
                            <div className="col">
                                <h5>Career Stats</h5>
                                <div className="row mt-2">
                                    <div className="col-auto">
                                        <h6>Games Played</h6>
                                        <p className="text-small">
                                            {SeasonStats.GamesPlayed}
                                        </p>
                                    </div>
                                    <div className="ms-2 col-auto">
                                        <h6>Minutes</h6>
                                        <p className="text-small">
                                            {RoundToTwoDecimals(
                                                SeasonStats.MinutesPerGame
                                            )}
                                        </p>
                                    </div>
                                    <div className="col-auto">
                                        <h6>Possessions</h6>
                                        <p className="text-small">
                                            {RoundToTwoDecimals(
                                                SeasonStats.PossessionsPerGame
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <BBAStatsRow SeasonStats={SeasonStats} />
                            </div>
                            <div className="col">
                                <h5>Attributes</h5>
                                <div className="row">
                                    <div className="col-3">
                                        <p className="text-small">Finishing</p>
                                        <p className="text-small">
                                            {player.Finishing}
                                        </p>
                                    </div>
                                    <div className="col-3">
                                        <p className="text-small">Shooting2</p>
                                        <p className="text-small">
                                            {player.Shooting2}
                                        </p>
                                    </div>
                                    <div className="col-3">
                                        <p className="text-small">Shooting3</p>
                                        <p className="text-small">
                                            {player.Shooting3}
                                        </p>
                                    </div>
                                    <div className="col-3">
                                        <p className="text-small">Free Throw</p>
                                        <p className="text-small">
                                            {player.FreeThrow}
                                        </p>
                                    </div>
                                    <div className="col-3">
                                        <p className="text-small">Ballwork</p>
                                        <p className="text-small">
                                            {player.Ballwork}
                                        </p>
                                    </div>
                                    <div className="col-3">
                                        <p className="text-small">Rebounding</p>
                                        <p className="text-small">
                                            {player.Rebounding}
                                        </p>
                                    </div>
                                    <div className="col-3">
                                        <p className="text-small">
                                            Int. Defense
                                        </p>
                                        <p className="text-small">
                                            {player.InteriorDefense}
                                        </p>
                                    </div>
                                    <div className="col-3">
                                        <p className="text-small">
                                            Per. Defense
                                        </p>
                                        <p className="text-small">
                                            {player.PerimeterDefense}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const NBAFreeAgentOfferModal = ({
    team,
    player,
    ts,
    idx,
    extend,
    viewMode
}) => {
    const modalId = `offerModal${idx}`;
    const modalClass = GetModalClass(viewMode);
    const name = `${player.FirstName} ${player.LastName}`;
    const [existingOffer, setExistingOffer] = useState(null);
    const [offer, setOffer] = useState(() => {
        const offers = player.Offers;
        if (offers && offers.length > 0) {
            const offerIdx = player.Offers.findIndex(
                (x) => x.TeamID === team.ID
            );
            if (offerIdx < 0) {
                return {
                    PlayerID: player.ID,
                    TeamID: team.ID,
                    Team: `${team.Team} ${team.Nickname}`
                };
            }
            setExistingOffer(() => offers[offerIdx]);
            return offers[offerIdx];
        } else {
            return {
                PlayerID: player.ID,
                TeamID: team.ID,
                Team: `${team.Team} ${team.Nickname}`
            };
        }
    });
    // Comment Here
    const [hasExistingOffer, setExistingOfferBool] = useState(false);
    const [validOffer, setValidOffer] = useState(false);
    const [rule1Valid, setRule1] = useState(true);
    const [rule2Valid, setRule2] = useState(true);
    const [rule3Valid, setRule3] = useState(true);
    const [rule4Valid, setRule4] = useState(true);
    const [rule5Valid, setRule5] = useState(true);
    const { MinimumValue, MaxRequested, IsSuperMaxQualified, Year } = player;
    const maxPercentage = GetMaxPercentage(
        Year,
        MaxRequested,
        IsSuperMaxQualified
    );

    // Get the minimum required based on the current year cap.
    const yearlyRequirement = maxPercentage * ts.Y1Capspace;

    const minimumLabel =
        maxPercentage > 0
            ? `$${yearlyRequirement}M Per Year`
            : `$${MinimumValue}M`;

    const confirmChange = () => {
        return extend(player, offer);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (offer) {
            let off = { ...offer };
            off[name] = Number(value);

            ValidateOffer(off);
        }
    };

    const ToggleOption = (event) => {
        const { value } = event.target;
        const pref = { ...offer };
        pref[value] = !pref[value];

        ValidateOffer(pref);
    };

    const ValidateOffer = (offer) => {
        let BonusTotal = offer.TotalBonus;
        if (BonusTotal < 0) BonusTotal = 0;
        let y1Total = offer.Year1Total ? offer.Year1Total : 0;
        let y2Total = offer.Year2Total ? offer.Year2Total : 0;
        let y3Total = offer.Year3Total ? offer.Year3Total : 0;
        let y4Total = offer.Year4Total ? offer.Year4Total : 0;
        let y5Total = offer.Year5Total ? offer.Year5Total : 0;
        const salary = GetTotalValue(
            y1Total,
            y2Total,
            y3Total,
            y4Total,
            y5Total
        );
        const totalYears = offer.TotalYears;
        const totalCost = salary;
        const capsheet = team.Capsheet;
        const y1Value = y1Total * 1;
        const y2Value = y2Total * 1;
        const y3Value = y3Total * 1;
        const y4Value = y4Total * 1;
        const y5Value = y5Total * 1;
        const y1Space = GetNBACapSpace(
            ts.Y1Capspace,
            capsheet.Year1Total,
            capsheet.Year1Cap
        );
        const y2Space = GetNBACapSpace(
            ts.Y2Capspace,
            capsheet.Year2Total,
            capsheet.Year2Cap
        );
        const y3Space = GetNBACapSpace(
            ts.Y3Capspace,
            capsheet.Year3Total,
            capsheet.Year3Cap
        );
        const y4Space = GetNBACapSpace(
            ts.Y4Capspace,
            capsheet.Year4Total,
            capsheet.Year4Cap
        );
        const y5Space = GetNBACapSpace(
            ts.Y5Capspace,
            capsheet.Year5Total,
            capsheet.Year5Cap
        );
        const contractValue = GetTotalValue(
            y1Value,
            y2Value,
            y3Value,
            y4Value,
            y5Value
        );
        const updatedOffer = {
            ...offer,
            TotalBonus: BonusTotal,
            Year1Total: y1Total,
            Year2Total: y2Total,
            Year3Total: y3Total,
            Year4Total: y4Total,
            Year5Total: y5Total,
            TotalCost: totalCost,
            ValueY1: y1Value,
            ValueY2: y2Value,
            ValueY3: y3Value,
            ValueY4: y4Value,
            ValueY5: y5Value,
            Y1Remaining: y1Space - y1Total,
            Y2Remaining: y2Space - y2Total,
            Y3Remaining: y3Space - y3Total,
            Y4Remaining: y4Space - y4Total,
            Y5Remaining: y5Space - y5Total,
            ContractValue: contractValue,
            TotalYears: totalYears
        };

        const isRule1Valid = ValidateNBARule1(totalYears, player.Year);
        const isRule2Valid = ValidateNBARule2(
            totalYears,
            y1Total,
            y2Total,
            y3Total,
            y4Total,
            y5Total
        );

        const isRule3Valid = ValidateNBARule3(
            totalYears,
            offer.Year1Opt,
            offer.Year2Opt,
            offer.Year3Opt,
            offer.Year4Opt,
            offer.Year5Opt
        );

        const isRule4Valid = ValidateNBARule4(
            totalYears,
            y1Total,
            y2Total,
            y3Total,
            y4Total,
            y5Total,
            MinimumValue
        );
        const isRule5Valid = ValidateNBARule5(
            totalYears,
            y1Total,
            y2Total,
            y3Total,
            y4Total,
            y5Total,
            player.Overall
        );

        const canMakeOffer =
            player.IsAcceptingOffers ||
            (player.IsNegotiating && hasExistingOffer);

        const validToExistingOffer = !existingOffer
            ? true
            : existingOffer.ContractValue <= contractValue;

        const maxContractMinimum =
            yearlyRequirement > 0 ? yearlyRequirement * totalYears : 0;

        const minimumRequired =
            maxContractMinimum > 0 ? maxContractMinimum : MinimumValue;

        const meetRequirement =
            MaxRequested || IsSuperMaxQualified
                ? totalCost >= minimumRequired
                : contractValue >= minimumRequired;

        const isValid =
            meetRequirement &&
            isRule1Valid &&
            isRule2Valid &&
            isRule3Valid &&
            isRule4Valid &&
            isRule5Valid &&
            canMakeOffer &&
            validToExistingOffer;

        setRule1(() => isRule1Valid);
        setRule2(() => isRule2Valid);
        setRule3(() => isRule3Valid);
        setRule4(() => isRule4Valid);
        setRule5(() => isRule5Valid);
        setValidOffer(() => isValid);
        setOffer(() => updatedOffer);
    };

    useEffect(() => {
        if (player) {
            GetTeamOffer(player.Offers);
            const offers = player.Offers;
            if (offers && offers.length > 0) {
                const offerIdx = player.Offers.findIndex(
                    (x) => x.TeamID === team.ID
                );
                if (offerIdx > -1) {
                    setExistingOfferBool(() => true);
                    ValidateOffer(offers[offerIdx]);
                }
            }
        }
    }, [player]);

    const GetTeamOffer = (offers) => {
        if (offers && offers.length > 0) {
            let teamOffer = offers.findIndex((x) => x.TeamID === team.ID);
            if (teamOffer > -1) {
                setOffer(() => offers[teamOffer]);
            }
        }
    };

    const OfferButton = () => {
        if (validOffer) {
            if (!hasExistingOffer && player.IsAcceptingOffers) {
                return (
                    <button
                        type="button"
                        className="btn btn-danger"
                        data-bs-dismiss="modal"
                        onClick={confirmChange}
                    >
                        Yes
                    </button>
                );
            } else if (
                hasExistingOffer &&
                (player.IsAcceptingOffers || player.IsNegotiating)
            ) {
                return (
                    <button
                        type="button"
                        className="btn btn-warning"
                        data-bs-dismiss="modal"
                        onClick={confirmChange}
                    >
                        Update
                    </button>
                );
            }
        }
        if (!hasExistingOffer) {
            return (
                <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    disabled
                >
                    Yes
                </button>
            );
        }
        return (
            <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                disabled
            >
                Update
            </button>
        );
    };

    return (
        <div
            className="modal fade"
            id={modalId}
            tabIndex="-1"
            aria-labelledby="extendPlayerModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-xl">
                <div className={modalClass}>
                    <div className="modal-header">
                        <h4 className="modal-title" id="redshirtModalLabel">
                            {team.Team}: Make Offer to {name}, {player.Year}{' '}
                            Year {player.Archetype} {player.Position}
                        </h4>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-auto">
                                <h4 className="">Height: {player.Height}"</h4>
                            </div>
                            <div className="col-md-auto">
                                <h4 className="">Overall: {player.Overall}</h4>
                            </div>
                            <div className="col-md-auto ms-auto">
                                <h4 className="">
                                    Contract Length: {offer.TotalYears} Years
                                </h4>
                            </div>
                            <div className="col-md-auto ms-auto">
                                <h4 className="">
                                    Minimum Value: {minimumLabel}
                                </h4>
                            </div>
                        </div>
                        <div className="row text-start text-small">
                            <div className="row text-start text-small">
                                <h5>Rules</h5>
                                <div className="row">
                                    <div className="col">
                                        <p
                                            className={`${
                                                !rule1Valid ? 'text-danger' : ''
                                            } text-small`}
                                        >
                                            1: Contracts can only be between 1-5
                                            years. (3 years if the player has
                                            been in the league for less than 4
                                            years)
                                        </p>
                                        <p
                                            className={`${
                                                !rule3Valid ? 'text-danger' : ''
                                            } text-small`}
                                        >
                                            3: The final year of a contract may
                                            be an option.
                                        </p>
                                        <p
                                            className={`${
                                                !rule5Valid ? 'text-danger' : ''
                                            } text-small`}
                                        >
                                            5: Yearly amounts must be at least
                                            5% higher than the previous year
                                            amount.
                                        </p>
                                    </div>
                                    <div className="col">
                                        <p
                                            className={`${
                                                !rule2Valid ? 'text-danger' : ''
                                            } text-small`}
                                        >
                                            2: Bids cannot offer yearly amounts
                                            outside the designated contract
                                            length.
                                        </p>
                                        <p
                                            className={`${
                                                !rule4Valid ? 'text-danger' : ''
                                            } text-small`}
                                        >
                                            4: An input for salary that isn't
                                            zero must be greater than the
                                            minimum asking amount.
                                        </p>
                                    </div>
                                </div>
                                {!validOffer && (
                                    <div className="row">
                                        <div className="col">
                                            <p className="text-danger">
                                                Please ensure that the total
                                                value of the contract has met
                                                the minimum value the player is
                                                requesting: {minimumLabel}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="row mt-2 text-start">
                            <h5>Contract Length</h5>
                        </div>
                        <div className="row mt-1">
                            <div className="col-auto">
                                <input
                                    name="TotalYears"
                                    type="number"
                                    className="form-control"
                                    id="TotalYears"
                                    aria-describedby="TotalYears"
                                    value={offer ? offer.TotalYears : 0}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="row mt-2 text-start">
                            <h5>Total</h5>
                        </div>
                        <div className="row mt-1">
                            <OfferInput
                                name="Year1Total"
                                value={
                                    offer
                                        ? RoundToTwoDecimals(offer.Year1Total)
                                        : 0
                                }
                                change={handleInputChange}
                                label="Year 1"
                            />
                            <OfferInput
                                name="Year2Total"
                                value={
                                    offer
                                        ? RoundToTwoDecimals(offer.Year2Total)
                                        : 0
                                }
                                change={handleInputChange}
                                label="Year 2"
                            />
                            <OfferInput
                                name="Year3Total"
                                value={
                                    offer
                                        ? RoundToTwoDecimals(offer.Year3Total)
                                        : 0
                                }
                                change={handleInputChange}
                                label="Year 3"
                            />
                            <OfferInput
                                name="Year4Total"
                                value={
                                    offer
                                        ? RoundToTwoDecimals(offer.Year4Total)
                                        : 0
                                }
                                change={handleInputChange}
                                label="Year 4"
                            />
                            <OfferInput
                                name="Year5Total"
                                value={
                                    offer
                                        ? RoundToTwoDecimals(offer.Year5Total)
                                        : 0
                                }
                                change={handleInputChange}
                                label="Year 5"
                            />
                            <TotalInput
                                name="TotalCost"
                                value={RoundToTwoDecimals(offer.TotalCost)}
                                change={handleInputChange}
                                label="Total Overall"
                                isTotal={true}
                            />
                        </div>
                        <div className="row mt-1 text-start">
                            <h5>Options</h5>
                        </div>
                        <div className="row mt-1">
                            <div className="col"></div>
                            <div className="col">
                                <h6>Year 2 Option</h6>
                                <SwitchToggle
                                    value="Year2Opt"
                                    checkValue={offer ? offer.Year2Opt : false}
                                    change={ToggleOption}
                                />
                            </div>
                            <div className="col">
                                <h6>Year 3 Option</h6>
                                <SwitchToggle
                                    value="Year3Opt"
                                    checkValue={offer ? offer.Year3Opt : false}
                                    change={ToggleOption}
                                />
                            </div>
                            <div className="col">
                                <h6>Year 4 Option</h6>
                                <SwitchToggle
                                    value="Year4Opt"
                                    checkValue={offer ? offer.Year4Opt : false}
                                    change={ToggleOption}
                                />
                            </div>
                            <div className="col">
                                <h6>Year 5 Option</h6>
                                <SwitchToggle
                                    value="Year5Opt"
                                    checkValue={offer ? offer.Year5Opt : false}
                                    change={ToggleOption}
                                />
                            </div>
                        </div>
                        <div className="row mt-1 text-start">
                            <h5>Offer Value</h5>
                        </div>
                        <div className="row mt-1">
                            <TotalInput
                                name="ValueY1"
                                value={RoundToTwoDecimals(offer.ValueY1)}
                                change={handleInputChange}
                                label="Value Year 1"
                                isTotal={true}
                            />
                            <TotalInput
                                name="ValueY2"
                                value={RoundToTwoDecimals(offer.ValueY2)}
                                change={handleInputChange}
                                label="Value Year 2"
                                isTotal={true}
                            />
                            <TotalInput
                                name="ValueY3"
                                value={RoundToTwoDecimals(offer.ValueY3)}
                                change={handleInputChange}
                                label="Value Year 3"
                                isTotal={true}
                            />
                            <TotalInput
                                name="ValueY4"
                                value={RoundToTwoDecimals(offer.ValueY4)}
                                change={handleInputChange}
                                label="Value Year 4"
                                isTotal={true}
                            />
                            <TotalInput
                                name="ValueY5"
                                value={RoundToTwoDecimals(offer.ValueY5)}
                                change={handleInputChange}
                                label="Value Year 5"
                                isTotal={true}
                            />
                            <TotalInput
                                name="ContractValue"
                                value={RoundToTwoDecimals(offer.ContractValue)}
                                change={handleInputChange}
                                label="Contract Value"
                                isTotal={true}
                            />
                        </div>
                        <div className="row mt-1 text-start">
                            <h5>Cap Remaining</h5>
                        </div>
                        <div className="row mt-1">
                            <TotalInput
                                name="Y1Remaining"
                                value={RoundToTwoDecimals(offer.Y1Remaining)}
                                change={handleInputChange}
                                label="Cap Year 1"
                                isTotal={true}
                            />
                            <TotalInput
                                name="Y2Remaining"
                                value={RoundToTwoDecimals(offer.Y2Remaining)}
                                change={handleInputChange}
                                label="Cap Year 2"
                                isTotal={true}
                            />
                            <TotalInput
                                name="Y3Remaining"
                                value={RoundToTwoDecimals(offer.Y3Remaining)}
                                change={handleInputChange}
                                label="Cap Year 3"
                                isTotal={true}
                            />
                            <TotalInput
                                name="Y4Remaining"
                                value={RoundToTwoDecimals(offer.Y4Remaining)}
                                change={handleInputChange}
                                label="Cap Year 4"
                                isTotal={true}
                            />
                            <TotalInput
                                name="Y5Remaining"
                                value={RoundToTwoDecimals(offer.Y5Remaining)}
                                change={handleInputChange}
                                label="Cap Year 5"
                                isTotal={true}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                        >
                            No
                        </button>
                        <OfferButton />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const NBAWaiverOfferModal = ({
    team,
    player,
    ts,
    idx,
    extend,
    viewMode
}) => {
    const modalId = `waiverModal${idx}`;
    const modalClass = GetModalClass(viewMode);
    const name = `${player.FirstName} ${player.LastName}`;
    const [offer, setOffer] = useState(() => {
        const { Capsheet } = team;
        const c = player.Contract;
        const y1Space = GetNBACapSpace(
            ts.Y1Capspace,
            Capsheet.Year1Total,
            Capsheet.Year1Cap
        );
        const y2Space = GetNBACapSpace(
            ts.Y2Capspace,
            Capsheet.Year2Total,
            Capsheet.Year2Cap
        );
        const y3Space = GetNBACapSpace(
            ts.Y3Capspace,
            Capsheet.Year3Total,
            Capsheet.Year3Cap
        );
        const y4Space = GetNBACapSpace(
            ts.Y4Capspace,
            Capsheet.Year4Total,
            Capsheet.Year4Cap
        );
        const y5Space = GetNBACapSpace(
            ts.Y5Capspace,
            Capsheet.Year5Total,
            Capsheet.Year5Cap
        );
        const y1Value = c.Year1Total * 1;
        const y2Value = c.Year2Total * 0.9;
        const y3Value = c.Year3Total * 0.8;
        const y4Value = c.Year4Total * 0.7;
        const y5Value = c.Year5Total * 0.6;
        return {
            PlayerID: c.PlayerID,
            TeamID: team.ID,
            Team: `${team.Team} ${team.Nickname}`,
            OriginalTeamID: c.OriginalTeamID,
            OriginalTeam: c.OriginalTeam,
            YearsRemaining: c.YearsRemaining,
            Year1Total: c.Year1Total,
            Year2Total: c.Year2Total,
            Year3Total: c.Year3Total,
            Year4Total: c.Year4Total,
            Year5Total: c.Year5Total,
            Year1Opt: c.Year1Opt,
            Year2Opt: c.Year2Opt,
            Year3Opt: c.Year3Opt,
            Year4Opt: c.Year4Opt,
            Year5Opt: c.Year5Opt,
            Y1Remaining: y1Space - c.Year1Total,
            Y2Remaining: y2Space - c.Year2Total,
            Y3Remaining: y3Space - c.Year3Total,
            Y4Remaining: y4Space - c.Year4Total,
            Y5Remaining: y5Space - c.Year5Total,
            ValueY1: y1Value,
            ValueY2: y2Value,
            ValueY3: y3Value,
            ValueY4: y4Value,
            ValueY5: y5Value,
            ContractType: c.ContractType,
            ContractValue: c.ContractValue,
            IsActive: c.IsActive
        };
    });
    // Comment Here
    const { MinimumValue, MaxRequested, IsSuperMaxQualified, Year } = player;
    const maxPercentage = GetMaxPercentage(
        Year,
        MaxRequested,
        IsSuperMaxQualified
    );

    // Get the minimum required based on the current year cap.
    const yearlyRequirement = maxPercentage * ts.Y1Capspace;
    const minimumLabel =
        maxPercentage > 0
            ? `$${yearlyRequirement}M Per Year`
            : `$${MinimumValue}M`;

    const confirmChange = () => {
        return extend(player, offer);
    };

    const OfferButton = () => {
        return (
            <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
                onClick={confirmChange}
            >
                Offer
            </button>
        );
    };

    return (
        <div
            className="modal fade"
            id={modalId}
            tabIndex="-1"
            aria-labelledby="extendPlayerModalLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-xl">
                <div className={modalClass}>
                    <div className="modal-header">
                        <h4 className="modal-title" id="redshirtModalLabel">
                            {team.Team}: Make Offer to {name}, {player.Year}{' '}
                            Year {player.Archetype} {player.Position}
                        </h4>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-auto">
                                <h4 className="">Height: {player.Height}"</h4>
                            </div>
                            <div className="col-md-auto">
                                <h4 className="">Overall: {player.Overall}</h4>
                            </div>
                            <div className="col-md-auto ms-auto">
                                <h4 className="">
                                    Contract Length:{' '}
                                    {offer ? offer.YearsRemaining : 0} Years
                                </h4>
                            </div>
                            <div className="col-md-auto ms-auto">
                                <h4 className="">
                                    Minimum Value: {minimumLabel}
                                </h4>
                            </div>
                        </div>
                        <div className="row mt-2 text-start">
                            <h5>Contract Length</h5>
                        </div>
                        <div className="row mt-1">
                            <div className="col-auto">
                                <input
                                    name="TotalYears"
                                    type="number"
                                    className="form-control"
                                    id="TotalYears"
                                    aria-describedby="TotalYears"
                                    value={offer ? offer.YearsRemaining : 0}
                                    disabled={true}
                                />
                            </div>
                        </div>
                        <div className="row mt-2 text-start">
                            <h5>Total</h5>
                        </div>
                        <div className="row mt-1">
                            <TotalInput
                                name="Year1Total"
                                value={
                                    offer
                                        ? RoundToTwoDecimals(offer.Year1Total)
                                        : 0
                                }
                                label="Year 1"
                            />
                            <TotalInput
                                name="Year2Total"
                                value={
                                    offer
                                        ? RoundToTwoDecimals(offer.Year2Total)
                                        : 0
                                }
                                label="Year 2"
                            />
                            <TotalInput
                                name="Year3Total"
                                value={
                                    offer
                                        ? RoundToTwoDecimals(offer.Year3Total)
                                        : 0
                                }
                                label="Year 3"
                            />
                            <TotalInput
                                name="Year4Total"
                                value={
                                    offer
                                        ? RoundToTwoDecimals(offer.Year4Total)
                                        : 0
                                }
                                label="Year 4"
                            />
                            <TotalInput
                                name="Year5Total"
                                value={
                                    offer
                                        ? RoundToTwoDecimals(offer.Year5Total)
                                        : 0
                                }
                                label="Year 5"
                            />
                            <TotalInput
                                name="TotalCost"
                                value={RoundToTwoDecimals(offer.TotalCost)}
                                label="Total Overall"
                                isTotal={true}
                            />
                        </div>
                        <div className="row mt-1 text-start">
                            <h5>Options</h5>
                        </div>
                        <div className="row mt-1">
                            <div className="col"></div>
                            <div className="col">
                                <h6>Year 2 Option</h6>
                                <SwitchToggle
                                    value="Year2Opt"
                                    checkValue={offer ? offer.Year2Opt : false}
                                />
                            </div>
                            <div className="col">
                                <h6>Year 3 Option</h6>
                                <SwitchToggle
                                    value="Year3Opt"
                                    checkValue={offer ? offer.Year3Opt : false}
                                />
                            </div>
                            <div className="col">
                                <h6>Year 4 Option</h6>
                                <SwitchToggle
                                    value="Year4Opt"
                                    checkValue={offer ? offer.Year4Opt : false}
                                />
                            </div>
                            <div className="col">
                                <h6>Year 5 Option</h6>
                                <SwitchToggle
                                    value="Year5Opt"
                                    checkValue={offer ? offer.Year5Opt : false}
                                />
                            </div>
                        </div>
                        <div className="row mt-1 text-start">
                            <h5>Offer Value</h5>
                        </div>
                        <div className="row mt-1">
                            <TotalInput
                                name="ValueY1"
                                value={RoundToTwoDecimals(offer.ValueY1)}
                                label="Value Year 1"
                                isTotal={true}
                            />
                            <TotalInput
                                name="ValueY2"
                                value={RoundToTwoDecimals(offer.ValueY2)}
                                label="Value Year 2"
                                isTotal={true}
                            />
                            <TotalInput
                                name="ValueY3"
                                value={RoundToTwoDecimals(offer.ValueY3)}
                                label="Value Year 3"
                                isTotal={true}
                            />
                            <TotalInput
                                name="ValueY4"
                                value={RoundToTwoDecimals(offer.ValueY4)}
                                label="Value Year 4"
                                isTotal={true}
                            />
                            <TotalInput
                                name="ValueY5"
                                value={RoundToTwoDecimals(offer.ValueY5)}
                                label="Value Year 5"
                                isTotal={true}
                            />
                            <TotalInput
                                name="ContractValue"
                                value={RoundToTwoDecimals(offer.ContractValue)}
                                label="Contract Value"
                                isTotal={true}
                            />
                        </div>
                        <div className="row mt-1 text-start">
                            <h5>Cap Remaining</h5>
                        </div>
                        <div className="row mt-1">
                            <TotalInput
                                name="Y1Remaining"
                                value={RoundToTwoDecimals(offer.Y1Remaining)}
                                label="Cap Year 1"
                                isTotal={true}
                            />
                            <TotalInput
                                name="Y2Remaining"
                                value={RoundToTwoDecimals(offer.Y2Remaining)}
                                label="Cap Year 2"
                                isTotal={true}
                            />
                            <TotalInput
                                name="Year3Remaining"
                                value={RoundToTwoDecimals(offer.Y3Remaining)}
                                label="Cap Year 3"
                                isTotal={true}
                            />
                            <TotalInput
                                name="Y4Remaining"
                                value={RoundToTwoDecimals(offer.Y4Remaining)}
                                label="Cap Year 4"
                                isTotal={true}
                            />
                            <TotalInput
                                name="Y5Remaining"
                                value={RoundToTwoDecimals(offer.Y5Remaining)}
                                label="Cap Year 5"
                                isTotal={true}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                        >
                            No
                        </button>
                        <OfferButton />
                    </div>
                </div>
            </div>
        </div>
    );
};
