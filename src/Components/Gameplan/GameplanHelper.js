import React from 'react';

export const GetMaxForPassPlays = (scheme, idx) => {
    let max = '20';
    if (idx === 0) {
        // Quick Passes
        if (scheme === 'Pro') {
            max = '45';
        } else {
            max = '50';
        }
    } else if (idx === 1) {
        // Short Passes
        if (scheme === 'Pro') {
            max = '45';
        } else {
            max = '50';
        }
    } else if (idx === 2) {
        // Long Passes
        if (scheme === 'Pro') {
            max = '45';
        } else if (scheme === 'Air Raid') {
            max = '50';
        } else {
            max = '35';
        }
    } else if (idx === 3) {
        // Screens. Do nothing.
    } else if (idx === 4) {
        // PA Short
        if (scheme === 'Double Wing Option') {
            max = '30';
        }
    } else {
        // PA Long
        if (scheme === 'Double Wing Option') {
            max = '30';
        }
    }
    return max;
};

export const GetDefenseFormationLabel = (idx) => {
    let name = 'DefPersonnel';
    if (idx === 0) {
        name = name.concat('One');
    } else if (idx === 1) {
        name = name.concat('Two');
    } else {
        name = name.concat('Three');
    }
    return name;
};

export const ValidateRunPlayDistribution = (gp) => {
    let valid = true;

    if (
        gp.RunOutsideLeft > 80 ||
        gp.RunOutsideRight > 80 ||
        gp.RunInsideLeft > 80 ||
        gp.RunInsideRight > 80 ||
        gp.RunPowerLeft > 80 ||
        gp.RunPowerRight > 80 ||
        gp.ReadOptionLeft > 80 ||
        gp.ReadOptionRight > 80 ||
        gp.SpeedOptionLeft > 80 ||
        gp.SpeedOptionRight > 80 ||
        gp.InvertedOptionLeft > 80 ||
        gp.InvertedOptionRight > 80 ||
        gp.TripleOptionLeft > 80 ||
        gp.TripleOptionRight > 80 ||
        gp.RunDrawLeft > 15 ||
        gp.RunDrawRight > 15
    ) {
        valid = false;
    }

    return valid;
};

export const ValidatePassPlayDistribution = (gp) => {
    const scheme = gp.OffensiveScheme;

    switch (scheme) {
        case 'Air Raid':
        case 'Vertical':
        case 'West Coast':
        case 'Run and Shoot':
            if (gp.PassShort > 50) {
                return false;
            }

            if (gp.PassMedium + gp.PassPAMedium > 50) {
                return false;
            }
            if (gp.PassLong + gp.PassPALong > 50) {
                return false;
            }
            if (gp.PassDeep + gp.PassPADeep > 15) {
                return false;
            }

            if (gp.PassScreen > 20) {
                return false;
            }
            break;
        case 'Pro':
        case 'Power Run':
        case 'I Option':
            if (gp.PassShort > 45) {
                return false;
            }

            if (gp.PassMedium > 45) {
                return false;
            }
            if (gp.PassLong > 45) {
                return false;
            }
            if (gp.PassDeep + gp.PassPADeep > 10) {
                return false;
            }

            if (gp.PassScreen > 20) {
                return false;
            }

            if (gp.PassPAShort > 20) {
                return false;
            }

            if (gp.PassPALong > 20) {
                return false;
            }
            break;
        case 'Double Wing Option':
        case 'Wing-T':
        case 'Flexbone':
        case 'Wishbone':
            if (gp.PassShort > 50) {
                return false;
            }

            if (gp.PassMedium > 50) {
                return false;
            }

            if (gp.PassLong > 50) {
                return false;
            }

            if (gp.PassDeep + gp.PassPADeep > 10) {
                return false;
            }

            if (gp.PassScreen > 20) {
                return false;
            }

            if (gp.PassPAShort > 30) {
                return false;
            }

            if (gp.PassPALong > 30) {
                return false;
            }
            break;
        case 'Spread Option':
        case 'Pistol':
            if (gp.PassShort > 50) {
                return false;
            }

            if (gp.PassMedium > 50) {
                return false;
            }
            if (gp.PassLong > 50) {
                return false;
            }
            if (gp.PassDeep + gp.PassPADeep > 10) {
                return false;
            }

            if (gp.PassScreen > 20) {
                return false;
            }

            if (gp.PassPAShort > 25) {
                return false;
            }

            if (gp.PassPALong > 25) {
                return false;
            }
            break;
        default:
            break;
    }

    return true;
};

export const GetDefensivePositions = (list) => {
    return list.map((item, index) => {
        if (item === '\n') return <br key={index} />;

        return (
            <span key={index}>
                {item}
                {index < list.length - 1 ? ', ' : ''}
            </span>
        );
    });
};

export const GetDefaultChanges = (scheme) => {};
