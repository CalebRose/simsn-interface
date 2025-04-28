import React, { useEffect, useState } from 'react';
import { GetModalClass } from '../../../Constants/CSSClassHelper';
import { GetNFLOverall } from '../../../_Utility/RosterHelper';
import {
    CapRemainingRow,
    NFLBonusRow,
    NFLSalaryRow,
    NFLTotalRow,
    OfferValueRow
} from '../../_Common/CommonOfferComponents';
import {
    GetCapSpace,
    GetContractLength,
    GetMaxPercentage,
    GetNBACapSpace,
    GetTotalValue,
    GetYearlyValue,
    ValidateNBARule2,
    ValidateNBARule3,
    ValidateNBARule4,
    ValidateNBARule5,
    ValidateRule2,
    ValidateRule3,
    ValidateRule4,
    ValidateRule5,
    ValidateRule6
} from '../FreeAgency/FreeAgencyHelper';
import { OfferInput, TotalInput } from '../FreeAgency/FreeAgencyOfferInput';
import { SwitchToggle } from '../../_Common/SwitchToggle';
import { RoundToTwoDecimals } from '../../../_Utility/utilHelper';

export const ExtendPlayerModal = ({
    player,
    idx,
    extend,
    viewMode,
    team,
    ts,
    cancel
}) => {
    const modalId = `extendPlayer${idx}`;
    const name = `${player.FirstName} ${player.LastName}`;
    const modalClass = GetModalClass(viewMode);
    const [existingExtension, setExistingExtension] = useState(null);
    const [hasExistingExtension, setExistingExtensionBool] = useState(false);
    const [offer, setOffer] = useState(() => {
        const offers = player.Extensions;
        if (offers && offers.length > 0) {
            const offerIdx = player.Extensions.findIndex(
                (x) => x.TeamID === team.ID
            );
            if (offerIdx < 0) {
                return {
                    NFLPlayerID: player.ID,
                    TeamID: team.ID,
                    Team: `${team.TeamName} ${team.Mascot}`
                };
            }
            setExistingExtension(() => offers[offerIdx]);
            return offers[offerIdx];
        } else {
            return {
                NFLPlayerID: player.ID,
                TeamID: team.ID,
                Team: `${team.TeamName} ${team.Mascot}`
            };
        }
    });
    const [validOffer, setValidOffer] = useState(false);
    const [rule1Valid, setRule1] = useState(true);
    const [rule2Valid, setRule2] = useState(true);
    const [rule3Valid, setRule3] = useState(true);
    const [rule4Valid, setRule4] = useState(true);
    const [rule5Valid, setRule5] = useState(true);
    const [rule6Valid, setRule6] = useState(true);
    const { MinimumValue } = player;
    const ovr = GetNFLOverall(player.Overall, player.ShowLetterGrade);

    const confirmChange = () => {
        return extend(player, offer);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (offer) {
            let updatedOffer = { ...offer };
            updatedOffer[name] = Number(value);

            ValidateOffer(updatedOffer);
        }
    };

    const ValidateOffer = (offer) => {
        let BonusTotal = offer.TotalBonus;
        if (BonusTotal < 0) BonusTotal = 0;
        let y1Bonus = 0;
        let y2Bonus = 0;
        let y3Bonus = 0;
        let y4Bonus = 0;
        let y5Bonus = 0;
        const salary = GetTotalValue(
            offer.Y1BaseSalary,
            offer.Y2BaseSalary,
            offer.Y3BaseSalary,
            offer.Y4BaseSalary,
            offer.Y5BaseSalary
        );
        const contractLength = offer.ContractLength;
        const bonusByYear = BonusTotal / contractLength;
        y1Bonus = contractLength > 0 ? bonusByYear : 0;
        y2Bonus = contractLength > 1 ? bonusByYear : 0;
        y3Bonus = contractLength > 2 ? bonusByYear : 0;
        y4Bonus = contractLength > 3 ? bonusByYear : 0;
        y5Bonus = contractLength > 4 ? bonusByYear : 0;
        const totalOverall = BonusTotal + salary;
        const capsheet = team.Capsheet;
        const y1Total = GetYearlyValue(y1Bonus, offer.Y1BaseSalary);
        const y2Total = GetYearlyValue(y2Bonus, offer.Y2BaseSalary);
        const y3Total = GetYearlyValue(y3Bonus, offer.Y3BaseSalary);
        const y4Total = GetYearlyValue(y4Bonus, offer.Y4BaseSalary);
        const y5Total = GetYearlyValue(y5Bonus, offer.Y5BaseSalary);
        const y1Value = y1Bonus * 1 + offer.Y1BaseSalary * 0.8;
        const y2Value = y2Bonus * 0.9 + offer.Y2BaseSalary * 0.4;
        const y3Value = y3Bonus * 0.8 + offer.Y3BaseSalary * 0.2;
        const y4Value = y4Bonus * 0.7 + offer.Y4BaseSalary * 0.1;
        const y5Value = y5Bonus * 0.6 + offer.Y5BaseSalary * 0.05;
        const y1Space = GetCapSpace(
            ts.Y2Capspace,
            capsheet.Y2Bonus,
            capsheet.Y2Salary,
            capsheet.Y2CapHit
        );
        const y2Space = GetCapSpace(
            ts.Y3Capspace,
            capsheet.Y3Bonus,
            capsheet.Y3Salary,
            capsheet.Y3CapHit
        );
        const y3Space = GetCapSpace(
            ts.Y4Capspace,
            capsheet.Y4Bonus,
            capsheet.Y4Salary,
            capsheet.Y4CapHit
        );
        const y4Space = GetCapSpace(
            ts.Y5Capspace,
            capsheet.Y5Bonus,
            capsheet.Y5Salary,
            capsheet.Y5CapHit
        );
        const y5Space = GetCapSpace(
            ts.Y5Capspace,
            capsheet.Y5Bonus,
            capsheet.Y5Salary,
            capsheet.Y5CapHit
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
            Y1Bonus: y1Bonus,
            Y2Bonus: y2Bonus,
            Y3Bonus: y3Bonus,
            Y4Bonus: y4Bonus,
            Y5Bonus: y5Bonus,
            TotalSalary: salary,
            TotalOverall: totalOverall,
            TotalY1: y1Total,
            TotalY2: y2Total,
            TotalY3: y3Total,
            TotalY4: y4Total,
            TotalY5: y5Total,
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
            ContractLength: contractLength
        };

        const isRule1Valid = contractLength > 0 && contractLength < 6;
        const isRule2Valid = ValidateRule2(
            contractLength,
            y1Total,
            y2Total,
            y3Total,
            y4Total,
            y5Total
        );

        const isRule3Valid = ValidateRule3(
            contractLength,
            y1Total,
            y2Total,
            y3Total,
            y4Total,
            y5Total
        );

        const isRule4Valid = ValidateRule4(
            contractLength,
            y1Total,
            y2Total,
            y3Total,
            y4Total,
            y5Total
        );

        const isRule5Valid = ValidateRule5(BonusTotal, totalOverall, true);

        const isRule6Valid = ValidateRule6(
            offer.Y1BaseSalary,
            offer.Y2BaseSalary,
            offer.Y3BaseSalary,
            offer.Y4BaseSalary,
            offer.Y5BaseSalary
        );

        // const canMakeOffer =
        //     player.IsAcceptingOffers ||
        //     (player.IsNegotiating && hasExistingExtension);

        const validToExistingOffer = !existingExtension
            ? true
            : existingExtension.ContractValue <= contractValue;

        const isValid =
            isRule1Valid &&
            isRule2Valid &&
            isRule3Valid &&
            isRule4Valid &&
            isRule5Valid &&
            isRule6Valid &&
            // canMakeOffer &&
            validToExistingOffer;

        setRule1(() => isRule1Valid);
        setRule2(() => isRule2Valid);
        setRule3(() => isRule3Valid);
        setRule4(() => isRule4Valid);
        setRule5(() => isRule5Valid);
        setRule6(() => isRule6Valid);
        setValidOffer(() => isValid);
        setOffer(() => updatedOffer);
    };

    useEffect(() => {
        if (player && player.Extensions && player.Extensions.length > 0) {
            GetTeamOffer(player.Extensions);
            const offers = player.Extensions;
            const offerIdx = player.Extensions.findIndex(
                (x) => x.TeamID === team.ID
            );
            if (offerIdx > -1) {
                setExistingExtensionBool(() => true);
                ValidateOffer(offers[offerIdx]);
            }
        }
    }, [player]);

    const GetTeamOffer = (offers) => {
        let teamOffer = offers.findIndex((x) => x.TeamID === team.ID);
        if (teamOffer > -1) {
            setOffer(() => offers[teamOffer]);
        }
    };

    const OfferButton = () => {
        let buttonText = 'Yes';
        let buttonClass = 'btn btn-secondary';
        let isDisabled = true;
        if (validOffer) {
            if (!hasExistingExtension) {
                buttonClass = 'btn btn-danger';
                isDisabled = false;
            } else {
                buttonText = 'Update';
                buttonClass = 'btn btn-warning';
                isDisabled = false;
            }
        }
        if (hasExistingExtension) {
            buttonText = 'Update';
        }

        return (
            <button
                type="button"
                className={buttonClass}
                data-bs-dismiss="modal"
                disabled={isDisabled}
                onClick={confirmChange}
            >
                {buttonText}
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
                            Extend Contract for {name}, {player.Experience} Year{' '}
                            {player.Archetype} {player.Position}
                        </h4>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        />
                    </div>
                    <div className="modal-body">
                        <div className="row mb-2">
                            <div className="col-md-3">
                                <h5>Bias: </h5>
                                <p>{player.FreeAgency}</p>
                            </div>
                            <div className="col-md-auto">
                                <h5 className="">Overall: </h5>
                                <p>{ovr}</p>
                            </div>
                            <div className="col-md-auto">
                                <h5 className="">Height & Weight</h5>
                                <p>
                                    {player.Height} inches, {player.Weight} lbs
                                </p>
                            </div>
                            <div className="col-md-auto">
                                <h5 className="">Current Contract:</h5>
                                <p>{player.Contract.ContractLength} Years</p>
                            </div>
                            <div className="col-md-auto ms-auto">
                                <h5 className="">Minimum Value</h5>
                                <p>${MinimumValue}M</p>
                            </div>
                        </div>
                        <div className="row text-start text-small">
                            <div className="row text-start text-small">
                                <h5>Rules</h5>
                                <div className="row">
                                    <div className="col">
                                        <p
                                            className={
                                                !rule1Valid ? 'text-danger' : ''
                                            }
                                        >
                                            1: Contracts can only be between 1-5
                                            years
                                        </p>
                                        <p
                                            className={
                                                !rule3Valid ? 'text-danger' : ''
                                            }
                                        >
                                            3: Contracts cannot increase by more
                                            than 50% (or $3M) from year to year
                                        </p>
                                        <p
                                            className={
                                                !rule5Valid ? 'text-danger' : ''
                                            }
                                        >
                                            5: 30% of any extension offer must
                                            be bonus money.
                                        </p>
                                    </div>
                                    <div className="col">
                                        <p
                                            className={
                                                !rule2Valid ? 'text-danger' : ''
                                            }
                                        >
                                            2: Salary cannot decrease (but can
                                            remain flat)
                                        </p>
                                        <p
                                            className={
                                                !rule4Valid ? 'text-danger' : ''
                                            }
                                        >
                                            4: Highest year cannot be more than
                                            100% of the lowest year (or $6M)
                                        </p>
                                        <p
                                            className={
                                                !rule6Valid ? 'text-danger' : ''
                                            }
                                        >
                                            6: An input for salary that isn't
                                            zero must be greater than 0.5.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-2 text-start">
                            <h5>Contract Length</h5>
                        </div>
                        <div className="row mt-1">
                            <div className="col-auto">
                                <input
                                    name="ContractLength"
                                    type="number"
                                    className="form-control"
                                    id="ContractLength"
                                    aria-describedby="ContractLength"
                                    value={offer ? offer.ContractLength : 0}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <NFLBonusRow
                            handleInputChange={handleInputChange}
                            offer={offer}
                            isFAOffer={true}
                        />
                        <NFLSalaryRow
                            handleInputChange={handleInputChange}
                            offer={offer}
                            isFAOffer={true}
                        />
                        <NFLTotalRow
                            handleInputChange={handleInputChange}
                            offer={offer}
                        />
                        <OfferValueRow
                            handleInputChange={handleInputChange}
                            offer={offer}
                        />
                        <CapRemainingRow
                            offer={offer}
                            handleInputChange={handleInputChange}
                        />
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary me-2"
                            data-bs-dismiss="modal"
                        >
                            No
                        </button>
                        {hasExistingExtension && (
                            <button
                                type="button"
                                className="btn btn-secondary me-2"
                                data-bs-dismiss="modal"
                                onClick={() => cancel(player, offer)}
                            >
                                Cancel
                            </button>
                        )}
                        <OfferButton />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ExtendNBAPlayerModal = ({
    player,
    idx,
    extend,
    activateOption,
    viewMode,
    team,
    ts,
    cancel
}) => {
    const [existingOffer, setExistingOffer] = useState(null);
    const [offer, setOffer] = useState(() => {
        const offers = player.Extensions;
        if (offers && offers.length > 0) {
            const offerIdx = player.Extensions.findIndex(
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
    const [hasExistingOffer, setExistingOfferBool] = useState(false);
    const [validOffer, setValidOffer] = useState(false);
    const [rule1Valid, setRule1] = useState(true);
    const [rule2Valid, setRule2] = useState(true);
    const [rule3Valid, setRule3] = useState(true);
    const [rule4Valid, setRule4] = useState(true);
    const [rule5Valid, setRule5] = useState(true);
    const { MinimumValue, MaxRequested, IsSuperMaxQualified, Year, Contract } =
        player;
    const { Year2Opt } = Contract;
    const maxPercentage = GetMaxPercentage(
        Year,
        MaxRequested,
        IsSuperMaxQualified
    );
    const modalId = `extendPlayer${idx}`;
    const name = `${player.FirstName} ${player.LastName}`;
    const modalClass = GetModalClass(viewMode);

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

        const isRule1Valid = totalYears > 0 && totalYears < 6;
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
            y5Total
        );

        // const canMakeOffer =
        //     player.IsAcceptingOffers ||
        //     (player.IsNegotiating && hasExistingOffer);

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

    const activate = () => {
        return activateOption(Contract.ID);
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
                            Extend Contract for {name}, {player.Year} Year{' '}
                            {player.Archetype} {player.Position}
                        </h4>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        />
                    </div>
                    <div className="modal-body">
                        {Year2Opt ? (
                            <>
                                <div className="row mb-2">
                                    <p>
                                        It looks like {name} has a option
                                        available on their contract. Clicking
                                        the activate button will activate the
                                        option, giving {name} the next year on
                                        their contract. Not accepting the option
                                        will opt for them to enter free agency.
                                    </p>
                                    <p>
                                        Would you like to activate the Year 2
                                        Option?
                                    </p>
                                </div>
                                <div className="row">
                                    <h6>Projected Year 2 Total:</h6>
                                    <p>
                                        {Contract.Year2Total > 0
                                            ? Contract.Year2Total
                                            : Contract.Year1Total * 1.05}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="row">
                                    <div className="col-md-auto">
                                        <h4 className="">
                                            Height: {player.Height}"
                                        </h4>
                                    </div>
                                    <div className="col-md-auto">
                                        <h4 className="">
                                            Overall: {player.Overall}
                                        </h4>
                                    </div>
                                    <div className="col-md-auto ms-auto">
                                        <h4 className="">
                                            Contract Length: {offer.TotalYears}{' '}
                                            Years
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
                                                    className={
                                                        !rule1Valid
                                                            ? 'text-danger'
                                                            : ''
                                                    }
                                                >
                                                    1: Contracts can only be
                                                    between 1-5 years
                                                </p>
                                                <p
                                                    className={
                                                        !rule3Valid
                                                            ? 'text-danger'
                                                            : ''
                                                    }
                                                >
                                                    3: The final year of a
                                                    contract may be an option.
                                                </p>
                                                <p
                                                    className={
                                                        !rule5Valid
                                                            ? 'text-danger'
                                                            : ''
                                                    }
                                                >
                                                    5: Yearly amounts do not
                                                    need to be equal, but bids
                                                    must be within 8% of the
                                                    preceding year.
                                                </p>
                                            </div>
                                            <div className="col">
                                                <p
                                                    className={
                                                        !rule2Valid
                                                            ? 'text-danger'
                                                            : ''
                                                    }
                                                >
                                                    2: Bids cannot offer yearly
                                                    amounts outside the
                                                    designated contract length.
                                                </p>
                                                <p
                                                    className={
                                                        !rule4Valid
                                                            ? 'text-danger'
                                                            : ''
                                                    }
                                                >
                                                    4: An input for salary that
                                                    isn't zero must be greater
                                                    than the minimum asking
                                                    amount.
                                                </p>
                                            </div>
                                        </div>
                                        {!validOffer && (
                                            <div className="row">
                                                <div className="col">
                                                    <p className="text-danger">
                                                        Please ensure that the
                                                        total value of the
                                                        contract has met the
                                                        minimum value the player
                                                        is requesting:{' '}
                                                        {minimumLabel}
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
                                                ? RoundToTwoDecimals(
                                                      offer.Year1Total
                                                  )
                                                : 0
                                        }
                                        change={handleInputChange}
                                        label="Year 1"
                                    />
                                    <OfferInput
                                        name="Year2Total"
                                        value={
                                            offer
                                                ? RoundToTwoDecimals(
                                                      offer.Year2Total
                                                  )
                                                : 0
                                        }
                                        change={handleInputChange}
                                        label="Year 2"
                                    />
                                    <OfferInput
                                        name="Year3Total"
                                        value={
                                            offer
                                                ? RoundToTwoDecimals(
                                                      offer.Year3Total
                                                  )
                                                : 0
                                        }
                                        change={handleInputChange}
                                        label="Year 3"
                                    />
                                    <OfferInput
                                        name="Year4Total"
                                        value={
                                            offer
                                                ? RoundToTwoDecimals(
                                                      offer.Year4Total
                                                  )
                                                : 0
                                        }
                                        change={handleInputChange}
                                        label="Year 4"
                                    />
                                    <OfferInput
                                        name="Year5Total"
                                        value={
                                            offer
                                                ? RoundToTwoDecimals(
                                                      offer.Year5Total
                                                  )
                                                : 0
                                        }
                                        change={handleInputChange}
                                        label="Year 5"
                                    />
                                    <TotalInput
                                        name="TotalCost"
                                        value={RoundToTwoDecimals(
                                            offer.TotalCost
                                        )}
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
                                            checkValue={
                                                offer ? offer.Year2Opt : false
                                            }
                                            change={ToggleOption}
                                        />
                                    </div>
                                    <div className="col">
                                        <h6>Year 3 Option</h6>
                                        <SwitchToggle
                                            value="Year3Opt"
                                            checkValue={
                                                offer ? offer.Year3Opt : false
                                            }
                                            change={ToggleOption}
                                        />
                                    </div>
                                    <div className="col">
                                        <h6>Year 4 Option</h6>
                                        <SwitchToggle
                                            value="Year4Opt"
                                            checkValue={
                                                offer ? offer.Year4Opt : false
                                            }
                                            change={ToggleOption}
                                        />
                                    </div>
                                    <div className="col">
                                        <h6>Year 5 Option</h6>
                                        <SwitchToggle
                                            value="Year5Opt"
                                            checkValue={
                                                offer ? offer.Year5Opt : false
                                            }
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
                                        value={RoundToTwoDecimals(
                                            offer.ValueY1
                                        )}
                                        change={handleInputChange}
                                        label="Value Year 1"
                                        isTotal={true}
                                    />
                                    <TotalInput
                                        name="ValueY2"
                                        value={RoundToTwoDecimals(
                                            offer.ValueY2
                                        )}
                                        change={handleInputChange}
                                        label="Value Year 2"
                                        isTotal={true}
                                    />
                                    <TotalInput
                                        name="ValueY3"
                                        value={RoundToTwoDecimals(
                                            offer.ValueY3
                                        )}
                                        change={handleInputChange}
                                        label="Value Year 3"
                                        isTotal={true}
                                    />
                                    <TotalInput
                                        name="ValueY4"
                                        value={RoundToTwoDecimals(
                                            offer.ValueY4
                                        )}
                                        change={handleInputChange}
                                        label="Value Year 4"
                                        isTotal={true}
                                    />
                                    <TotalInput
                                        name="ValueY5"
                                        value={RoundToTwoDecimals(
                                            offer.ValueY5
                                        )}
                                        change={handleInputChange}
                                        label="Value Year 5"
                                        isTotal={true}
                                    />
                                    <TotalInput
                                        name="ContractValue"
                                        value={RoundToTwoDecimals(
                                            offer.ContractValue
                                        )}
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
                                        value={RoundToTwoDecimals(
                                            offer.Y2Remaining
                                        )}
                                        change={handleInputChange}
                                        label="Cap Year 1"
                                        isTotal={true}
                                    />
                                    <TotalInput
                                        name="Y2Remaining"
                                        value={RoundToTwoDecimals(
                                            offer.Y3Remaining
                                        )}
                                        change={handleInputChange}
                                        label="Cap Year 2"
                                        isTotal={true}
                                    />
                                    <TotalInput
                                        name="Y3Remaining"
                                        value={RoundToTwoDecimals(
                                            offer.Y4Remaining
                                        )}
                                        change={handleInputChange}
                                        label="Cap Year 3"
                                        isTotal={true}
                                    />
                                    <TotalInput
                                        name="Y4Remaining"
                                        value={RoundToTwoDecimals(
                                            offer.Y5Remaining
                                        )}
                                        change={handleInputChange}
                                        label="Cap Year 4"
                                        isTotal={true}
                                    />
                                    <TotalInput
                                        name="Y5Remaining"
                                        value={RoundToTwoDecimals(
                                            offer.Y5Remaining + 5
                                        )}
                                        change={handleInputChange}
                                        label="Cap Year 5"
                                        isTotal={true}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="modal-footer">
                        {Year2Opt ? (
                            <button
                                type="button"
                                className="btn btn-danger me-2"
                                data-bs-dismiss="modal"
                                onClick={activate}
                            >
                                Activate
                            </button>
                        ) : (
                            <OfferButton />
                        )}
                        <button
                            type="button"
                            className="btn btn-secondary me-2"
                            data-bs-dismiss="modal"
                        >
                            No
                        </button>
                        {hasExistingOffer && (
                            <button
                                type="button"
                                className="btn btn-secondary me-2"
                                data-bs-dismiss="modal"
                                onClick={() => cancel(player, offer)}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
