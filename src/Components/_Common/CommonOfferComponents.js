import React from 'react';
import { RoundToTwoDecimals } from '../../_Utility/utilHelper';
import { TotalInput, OfferInput } from '../NFL/FreeAgency/FreeAgencyOfferInput';

export const CapRemainingRow = ({ handleInputChange, offer }) => (
    <>
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
    </>
);

export const NFLBonusRow = ({ handleInputChange, offer, isFAOffer }) => (
    <>
        <div className="row mt-2 text-start">
            <h5>Bonus</h5>
        </div>
        <div className="row mt-1">
            {isFAOffer ? (
                <TotalInput
                    name="Y1Bonus"
                    value={offer ? RoundToTwoDecimals(offer.Y1Bonus) : 0}
                    change={handleInputChange}
                    label="Year 1 Bonus"
                />
            ) : (
                <TotalInput
                    name="Y1Bonus"
                    value={offer ? RoundToTwoDecimals(offer.Y1Bonus) : 0}
                    label="Year 1 Bonus"
                />
            )}
            {isFAOffer ? (
                <TotalInput
                    name="Y2Bonus"
                    value={offer ? RoundToTwoDecimals(offer.Y2Bonus) : 0}
                    change={handleInputChange}
                    label="Year 2 Bonus"
                />
            ) : (
                <TotalInput
                    name="Y5Bonus"
                    value={offer ? RoundToTwoDecimals(offer.Y5Bonus) : 0}
                    label="Year 5 Bonus"
                />
            )}
            {isFAOffer ? (
                <TotalInput
                    name="Y3Bonus"
                    value={offer ? RoundToTwoDecimals(offer.Y3Bonus) : 0}
                    change={handleInputChange}
                    label="Year 3 Bonus"
                />
            ) : (
                <TotalInput
                    name="Y3Bonus"
                    value={offer ? RoundToTwoDecimals(offer.Y3Bonus) : 0}
                    label="Year 3 Bonus"
                />
            )}
            {isFAOffer ? (
                <TotalInput
                    name="Y4Bonus"
                    value={offer ? RoundToTwoDecimals(offer.Y4Bonus) : 0}
                    change={handleInputChange}
                    label="Year 4 Bonus"
                />
            ) : (
                <TotalInput
                    name="Y4Bonus"
                    value={offer ? RoundToTwoDecimals(offer.Y4Bonus) : 0}
                    label="Year 4 Bonus"
                />
            )}
            {isFAOffer ? (
                <TotalInput
                    name="Y5Bonus"
                    value={offer ? RoundToTwoDecimals(offer.Y5Bonus) : 0}
                    change={handleInputChange}
                    label="Year 5 Bonus"
                />
            ) : (
                <TotalInput
                    name="Y5Bonus"
                    value={offer ? RoundToTwoDecimals(offer.Y5Bonus) : 0}
                    label="Year 5 Bonus"
                />
            )}
            {isFAOffer ? (
                <OfferInput
                    name="TotalBonus"
                    value={offer ? offer.TotalBonus : 0}
                    change={handleInputChange}
                    label="Total Bonus"
                />
            ) : (
                <TotalInput
                    name="TotalBonus"
                    value={offer ? offer.TotalBonus : 0}
                    label="Total Bonus"
                />
            )}
        </div>
    </>
);

export const NFLSalaryRow = ({ handleInputChange, offer, isFAOffer }) => (
    <>
        <div className="row mt-1 text-start">
            <h5>Salary</h5>
        </div>
        <div className="row mt-1">
            {isFAOffer ? (
                <OfferInput
                    name="Y1BaseSalary"
                    value={offer.Y1BaseSalary}
                    change={handleInputChange}
                    label="Year 1 Salary"
                />
            ) : (
                <TotalInput
                    name="Y1BaseSalary"
                    value={offer.Y1BaseSalary}
                    label="Year 1 Salary"
                />
            )}

            {isFAOffer ? (
                <OfferInput
                    name="Y2BaseSalary"
                    value={offer.Y2BaseSalary}
                    change={handleInputChange}
                    label="Year 2 Salary"
                />
            ) : (
                <TotalInput
                    name="Y2BaseSalary"
                    value={offer.Y2BaseSalary}
                    label="Year 2 Salary"
                />
            )}
            {isFAOffer ? (
                <OfferInput
                    name="Y3BaseSalary"
                    value={offer.Y3BaseSalary}
                    change={handleInputChange}
                    label="Year 3 Salary"
                />
            ) : (
                <TotalInput
                    name="Y3BaseSalary"
                    value={offer.Y3BaseSalary}
                    label="Year 3 Salary"
                />
            )}

            {isFAOffer ? (
                <OfferInput
                    name="Y4BaseSalary"
                    value={offer.Y4BaseSalary}
                    change={handleInputChange}
                    label="Year 4 Salary"
                />
            ) : (
                <TotalInput
                    name="Y4BaseSalary"
                    value={offer.Y4BaseSalary}
                    label="Year 4 Salary"
                />
            )}
            {isFAOffer ? (
                <OfferInput
                    name="Y5BaseSalary"
                    value={offer.Y5BaseSalary}
                    change={handleInputChange}
                    label="Year 5 Salary"
                />
            ) : (
                <TotalInput
                    name="Y5BaseSalary"
                    value={offer.Y5BaseSalary}
                    label="Year 5 Salary"
                />
            )}
            <TotalInput
                name="TotalSalary"
                value={offer.TotalSalary}
                label="Total Salary"
            />
        </div>
    </>
);

export const NFLTotalRow = ({ handleInputChange, offer }) => (
    <>
        <div className="row mt-1 text-start">
            <h5>Total</h5>
        </div>
        <div className="row mt-1">
            <TotalInput
                name="TotalY1"
                value={RoundToTwoDecimals(offer.TotalY1)}
                change={handleInputChange}
                label="Total Year 1"
                isTotal={true}
            />
            <TotalInput
                name="TotalY2"
                value={RoundToTwoDecimals(offer.TotalY2)}
                change={handleInputChange}
                label="Total Year 2"
                isTotal={true}
            />
            <TotalInput
                name="TotalY3"
                value={RoundToTwoDecimals(offer.TotalY3)}
                change={handleInputChange}
                label="Total Year 3"
                isTotal={true}
            />
            <TotalInput
                name="TotalY4"
                value={RoundToTwoDecimals(offer.TotalY4)}
                change={handleInputChange}
                label="Total Year 4"
                isTotal={true}
            />
            <TotalInput
                name="TotalY5"
                value={RoundToTwoDecimals(offer.TotalY5)}
                change={handleInputChange}
                label="Total Year 5"
                isTotal={true}
            />
            <TotalInput
                name="TotalOverall"
                value={RoundToTwoDecimals(offer.TotalOverall)}
                change={handleInputChange}
                label="Total Overall"
                isTotal={true}
            />
        </div>
    </>
);

export const OfferValueRow = ({ handleInputChange, offer, aav }) => (
    <>
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
            <TotalInput
                name="AAV"
                value={RoundToTwoDecimals(aav)}
                label="AAV"
            />
        </div>
    </>
);
