import { Timestamp } from 'firebase/firestore';

export const calculateEndTimeNFL = (currentPick, timeLeft, isPaused) => {
    let seconds = 0;
    if (currentPick < 33 && timeLeft === 0) {
        seconds = 300; // 5 minutes
    } else if (currentPick > 32 && timeLeft === 0) {
        seconds = 180; // 3 minutes
    } else if (currentPick > 137 && timeLeft === 0) {
        seconds = 120; // 2 minutes
    } else if (isPaused && timeLeft > 0) {
        seconds = timeLeft;
    }

    return new Date(Date.now() + seconds * 1000);
};

export const calculateEndTime = (currentPick, timeLeft, isPaused) => {
    let seconds = 0;
    if (currentPick < 32 && timeLeft === 0) {
        seconds = 300; // 5 minutes
    } else if (currentPick >= 32 && timeLeft === 0) {
        seconds = 120; // 2 minutes
    } else if (isPaused && timeLeft > 0) {
        seconds = timeLeft;
    }

    return new Date(Date.now() + seconds * 1000);
};

export const GetStartTimerNFL = (
    data,
    currentPick,
    timeLeft,
    isPaused,
    updateData
) => {
    const endTime = calculateEndTimeNFL(currentPick, timeLeft, isPaused);
    const newData = {
        ...data,
        endTime: Timestamp.fromDate(endTime),
        isPaused: false,
        seconds: (endTime.getTime() - Date.now()) / 1000,
        startAt: Timestamp.fromDate(new Date())
    };

    updateData(newData);
};

export const GetStartTimer = (
    data,
    currentPick,
    timeLeft,
    isPaused,
    updateData
) => {
    const endTime = calculateEndTime(currentPick, timeLeft, isPaused);
    const newData = {
        ...data,
        endTime: Timestamp.fromDate(endTime),
        isPaused: false,
        seconds: (endTime.getTime() - Date.now()) / 1000,
        startAt: Timestamp.fromDate(new Date())
    };

    updateData(newData);
};

export const GetPauseTimer = (data, timeLeft, updateData) => {
    const newData = { ...data, isPaused: true, seconds: timeLeft };
    updateData(newData);
};

export const GetResetTimer = (data, updateData) => {
    const { currentPick } = data;
    let seconds = 0;
    if (currentPick < 33) {
        seconds = 300;
    } else if (currentPick < 131) {
        seconds = 180;
    } else {
        seconds = 120;
    }
    const endTime = Timestamp.fromDate(new Date(Date.now() + seconds * 1000)); // Current time + 4 minutes
    const newData = {
        ...data,
        endTime,
        isPaused: true,
        seconds,
        startAt: Timestamp.fromDate(new Date(Date.now()))
    }; // Current time + 4 minutes  };
    updateData(newData);
};

export const GetScoutableAttributes = (pos, arch, posTwo) => {
    let attrs = [];

    switch (pos) {
        case 'QB':
            attrs = attrs.concat([
                'Throw Power',
                'Throw Accuracy',
                'Football IQ',
                'Agility',
                'Speed',
                'Stamina',
                'Potential Grade'
            ]);
            break;

        case 'RB':
            attrs = attrs.concat([
                'Speed',
                'Agility',
                'Carrying',
                'Strength',
                'Football IQ',
                'Catching',
                'Potential Grade'
            ]);
            break;

        case 'FB':
            attrs = attrs.concat([
                'Speed',
                'Agility',
                'Carrying',
                'Strength',
                'Pass Block',
                'Run Block',
                'Potential Grade'
            ]);
            break;

        case 'TE':
            attrs = attrs.concat([
                'Speed',
                'Agility',
                'Carrying',
                'Catching',
                'Route Running',
                'Strength',
                'Pass Block',
                'Run Block',
                'Potential Grade'
            ]);
            break;

        case 'WR':
            attrs = attrs.concat([
                'Speed',
                'Agility',
                'Carrying',
                'Catching',
                'Route Running',
                'Potential Grade'
            ]);
            break;

        case 'OG':
        case 'OT':
        case 'C':
            attrs = attrs.concat([
                'Agility',
                'Strength',
                'Pass Block',
                'Run Block',
                'Football IQ',
                'Potential Grade'
            ]);
            break;

        case 'DT':
        case 'DE':
            attrs = attrs.concat([
                'Speed',
                'Agility',
                'Tackle',
                'Strength',
                'Pass Rush',
                'Run Defense',
                'Football IQ',
                'Potential Grade'
            ]);
            break;

        case 'OLB':
        case 'ILB':
            attrs = attrs.concat([
                'Speed',
                'Agility',
                'Tackle',
                'Pass Rush',
                'Run Defense',
                'Man Coverage',
                'Zone Coverage',
                'Football IQ',
                'Potential Grade'
            ]);
            break;

        case 'CB':
        case 'FS':
        case 'SS':
            attrs = attrs.concat([
                'Speed',
                'Agility',
                'Tackle',
                'Strength',
                'Man Coverage',
                'Zone Coverage',
                'Catching',
                'Football IQ',
                'Potential Grade'
            ]);
            break;

        case 'P':
        case 'K':
            attrs = attrs.concat([
                'Punt Power',
                'Punt Accuracy',
                'Kick Power',
                'Kick Accuracy',
                'Football IQ',
                'Potential Grade'
            ]);
            break;

        case 'ATH':
            if (arch === 'Field General') {
                attrs = attrs.concat([
                    'Football IQ',
                    'Throw Power',
                    'Throw Accuracy',
                    'Speed',
                    'Agility',
                    'Man Coverage',
                    'Zone Coverage',
                    'Potential Grade'
                ]);
            } else if (arch === 'Triple-Threat') {
                attrs = attrs.concat([
                    'Football IQ',
                    'Throw Power',
                    'Throw Accuracy',
                    'Speed',
                    'Agility',
                    'Carrying',
                    'Catching',
                    'Route Running',
                    'Potential Grade'
                ]);
            } else if (arch === 'Wingback') {
                attrs = attrs.concat([
                    'Football IQ',
                    'Speed',
                    'Agility',
                    'Carrying',
                    'Catching',
                    'Route Running',
                    'Man Coverage',
                    'Zone Coverage',
                    'Potential Grade'
                ]);
            } else if (arch === 'Slotback') {
                attrs = attrs.concat([
                    'Football IQ',
                    'Strength',
                    'Agility',
                    'Carrying',
                    'Catching',
                    'Route Running',
                    'Pass Block',
                    'Run Block',
                    'Potential Grade'
                ]);
            } else if (arch === 'Lineman') {
                attrs = attrs.concat([
                    'Football IQ',
                    'Strength',
                    'Agility',
                    'Pass Block',
                    'Run Block',
                    'Tackle',
                    'Pass Rush',
                    'Run Defense',
                    'Potential Grade'
                ]);
            } else if (
                arch === 'Strongside' ||
                arch === 'Weakside' ||
                arch === 'Bandit'
            ) {
                attrs = attrs.concat([
                    'Football IQ',
                    'Speed',
                    'Agility',
                    'Tackle',
                    'Pass Rush',
                    'Run Defense',
                    'Man Coverage',
                    'Zone Coverage',
                    'Potential Grade'
                ]);
            } else if (arch === 'Return Specialist') {
                attrs = attrs.concat([
                    'Football IQ',
                    'Speed',
                    'Agility',
                    'Catching',
                    'Carrying',
                    'Route Running',
                    'Tackle',
                    'Potential Grade'
                ]);
            } else if (arch === 'Soccer Player') {
                attrs = attrs.concat([
                    'Football IQ',
                    'Speed',
                    'Agility',
                    'Catching',
                    'Punt Power',
                    'Punt Accuracy',
                    'Kick Power',
                    'Kick Accuracy',
                    'Potential Grade'
                ]);
            }
            break;

        default:
            break;
    }

    switch (posTwo) {
        case 'QB':
            attrs = attrs.concat(['Throw Power', 'Throw Accuracy']);
            break;

        case 'RB':
            attrs = attrs.concat(['Speed', 'Carrying']);
            break;

        case 'FB':
            attrs = attrs.concat(['Carrying', 'Strength']);
            break;

        case 'TE':
            attrs = attrs.concat(['Catching', 'Strength']);
            break;

        case 'WR':
            attrs = attrs.concat(['Catching', 'Route Running']);
            break;

        case 'OG':
        case 'OT':
        case 'C':
            attrs = attrs.concat(['Pass Block', 'Run Block']);
            break;

        case 'DT':
        case 'DE':
            attrs = attrs.concat(['Pass Rush', 'Run Defense']);
            break;

        case 'OLB':
        case 'ILB':
            attrs = attrs.concat(['Pass Rush', 'Run Defense']);
            break;

        case 'CB':
        case 'FS':
        case 'SS':
            attrs = attrs.concat(['Man Coverage', 'Zone Coverage']);
            break;

        case 'P':
            attrs = attrs.concat(['Punt Power', 'Punt Accuracy']);
            break;
        case 'K':
            attrs = attrs.concat(['Kick Power', 'Kick Accuracy']);
            break;

        default:
            break;
    }

    return attrs;
};
