import { useMemo } from 'react';
import { getLogo } from '../Constants/getLogo';
import { SimNFL } from '../Constants/CommonConstants';

export const GetPicksByCurrentRound = (draftList, currentRound) => {
    const currentRoundOfPicks = useMemo(() => {
        if (draftList && currentRound > 0) {
            const round = draftList[currentRound];
            if (round) return round;
        }
        return [];
    }, [draftList, currentRound]);

    return currentRoundOfPicks;
};

export const GetRecentlyDraftedPlayer = (
    allDraftablePlayers,
    recentlyDraftedPlayerID
) => {
    const recentlyDraftedPlayer = useMemo(() => {
        if (allDraftablePlayers) {
            const idx = allDraftablePlayers.findIndex(
                (x) => x.ID === recentlyDraftedPlayerID
            );
            if (idx > -1) {
                const p = allDraftablePlayers[idx];
                return `${p.OverallGrade} Ovr ${p.Position} ${p.FirstName} ${p.LastName}`;
            }
        }
        return 'P David Ross';
    }, [allDraftablePlayers, recentlyDraftedPlayerID]);
    return recentlyDraftedPlayer;
};

export const useDraftMapNFL = (allDraftPicks) => {
    const draftMap = useMemo(() => {
        const draftMapObj = {};
        if (allDraftPicks) {
            for (let i = 1; i < 8; i++) {
                const roundOfPicks = allDraftPicks[i];
                for (let j = 0; j < roundOfPicks.length; j++) {
                    const pick = roundOfPicks[j];
                    if (pick.SelectedPlayerID > 0) {
                        draftMapObj[pick.SelectedPlayerID] = true;
                    }
                }
            }
        }
        return draftMapObj;
    }, [allDraftPicks]);

    return draftMap;
};

export const useDraftMap = (allDraftPicks) => {
    const draftMap = useMemo(() => {
        const draftMapObj = {};
        if (allDraftPicks) {
            for (let i = 1; i <= 2; i++) {
                const roundOfPicks = allDraftPicks[i];
                for (let j = 0; j < roundOfPicks.length; j++) {
                    const pick = roundOfPicks[j];
                    if (pick.SelectedPlayerID > 0) {
                        draftMapObj[pick.SelectedPlayerID] = true;
                    }
                }
            }
        }
        return draftMapObj;
    }, [allDraftPicks]);

    return draftMap;
};

export const GetCurrentDraftPickIdx = (
    allDraftPicks,
    currentPick,
    currentRound
) => {
    const currentDraftPickIdx = useMemo(() => {
        if (allDraftPicks) {
            const roundOfPicks = allDraftPicks[currentRound];
            const idx = roundOfPicks.findIndex(
                (x) => x.DraftNumber === currentPick
            );
            if (idx > -1) return idx;
            if (currentRound + 1 < 8) {
                const nextRoundOfPicks = allDraftPicks[currentRound + 1];
                return nextRoundOfPicks.findIndex(
                    (x) => x.DraftNumber === currentPick
                );
            }
        }
        return -1;
    }, [allDraftPicks, currentPick, currentRound]);
    return currentDraftPickIdx;
};

export const GetNBACurrentDraftPickIdx = (
    allDraftPicks,
    currentPick,
    currentRound
) => {
    const currentDraftPickIdx = useMemo(() => {
        if (allDraftPicks) {
            const roundOfPicks = allDraftPicks[currentRound];
            const idx = roundOfPicks.findIndex(
                (x) => x.DraftNumber === currentPick
            );
            if (idx > -1) return idx;
            if (currentRound + 1 < 3) {
                const nextRoundOfPicks = allDraftPicks[currentRound + 1];
                return nextRoundOfPicks.findIndex(
                    (x) => x.DraftNumber === currentPick
                );
            }
        }
        return -1;
    }, [allDraftPicks, currentPick, currentRound]);
    return currentDraftPickIdx;
};

export const GetCurrentDraftPick = (
    allDraftPicks,
    currentDraftPickIdx,
    currentPick,
    currentRound
) => {
    const currentDraftPick = useMemo(() => {
        if (allDraftPicks && currentRound > 0 && currentDraftPickIdx >= 0) {
            const roundOfPicks = allDraftPicks[currentRound];
            let indexCheck = roundOfPicks.findIndex(
                (x) => x.DraftNumber === currentPick
            );
            if (indexCheck > -1) {
                return roundOfPicks[currentDraftPickIdx];
            }
            const nextRoundOfPicks = allDraftPicks[currentRound + 1];
            return nextRoundOfPicks[currentDraftPickIdx];
        }
        return null;
    }, [allDraftPicks, currentDraftPickIdx, currentRound]);
    return currentDraftPick;
};

export const GetNextDraftPickIdx = (allDraftPicks, nextPick) => {
    const nextDraftPickIdx = useMemo(() => {
        if (allDraftPicks) {
            return allDraftPicks.findIndex((x) => x.DraftNumber === nextPick);
        }
        return -1;
    }, [allDraftPicks, nextPick]);
    return nextDraftPickIdx;
};

export const GetNextDraftPickObj = (allDraftPicks, nextDraftPickIdx) => {
    const nextDraftPick = useMemo(() => {
        if (allDraftPicks && nextDraftPickIdx >= 0) {
            return allDraftPicks[nextDraftPickIdx];
        }
        return null;
    }, [allDraftPicks, nextDraftPickIdx]);
    return nextDraftPick;
};

export const GetPickTeamLogo = (league, draftPick, isRetro) => {
    const logo = useMemo(() => {
        if (draftPick) {
            return getLogo(league, draftPick.TeamID, isRetro);
        }
        return null;
    }, [draftPick]);

    return logo;
};

export const GetViewablePlayersList = (
    allDraftablePlayers,
    selectedPositions,
    selectedColleges,
    selectedArchetypes,
    viewCount
) => {
    const viewablePlayers = useMemo(() => {
        let list = [];
        if (allDraftablePlayers && allDraftablePlayers.length > 0) {
            list = [...allDraftablePlayers];
            if (selectedPositions.length > 0) {
                list = list.filter((x) =>
                    selectedPositions.includes(x.Position)
                );
            }
            if (selectedArchetypes.length > 0) {
                list = list.filter((x) =>
                    selectedArchetypes.includes(x.Archetype)
                );
            }
            if (selectedColleges.length > 0) {
                list = list.filter((x) => selectedColleges.includes(x.College));
            }
            list = [...list].slice(0, viewCount);
        }
        return list;
    }, [
        allDraftablePlayers,
        selectedPositions,
        selectedArchetypes,
        selectedColleges,
        viewCount
    ]);
    return viewablePlayers;
};

export const GetTradeWarRoom = (nflWarRoom, col) => {
    const tradeWarRoom = useMemo(() => {
        let room = {};
        if (nflWarRoom && col && col.length > 0) {
            const roomIdx = col.findIndex((x) => x.id === nflWarRoom.Team);
            return col[roomIdx];
        }
        return room;
    }, [nflWarRoom, col]);
    return tradeWarRoom;
};
