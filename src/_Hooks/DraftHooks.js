import { useMemo } from 'react';
import { getLogo } from '../Constants/getLogo';
import { SimNFL } from '../Constants/CommonConstants';

export const GetPicksByCurrentRound = (draftList, currentRound) => {
    return useMemo(() => {
        if (draftList && currentRound > 0) {
            const round = draftList[currentRound];
            if (round) return round;
        }
        return [];
    }, [draftList, currentRound]);
};

export const GetRecentlyDraftedPlayer = (
    allDraftablePlayers,
    recentlyDraftedPlayerID
) => {
    return useMemo(() => {
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
};

export const useDraftMapNFL = (allDraftPicks) => {
    return useMemo(() => {
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
};

export const useDraftMap = (allDraftPicks) => {
    return useMemo(() => {
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
};

export const GetCurrentDraftPickIdx = (
    allDraftPicks,
    currentPick,
    currentRound
) => {
    return useMemo(() => {
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
};

export const GetNBACurrentDraftPickIdx = (
    allDraftPicks,
    currentPick,
    currentRound
) => {
    return useMemo(() => {
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
};

export const GetCurrentDraftPick = (
    allDraftPicks,
    currentDraftPickIdx,
    currentPick,
    currentRound
) => {
    return useMemo(() => {
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
};

export const GetNextDraftPickIdx = (allDraftPicks, nextPick) => {
    return useMemo(() => {
        if (allDraftPicks) {
            return allDraftPicks.findIndex((x) => x.DraftNumber === nextPick);
        }
        return -1;
    }, [allDraftPicks, nextPick]);
};

export const GetNextDraftPickObj = (allDraftPicks, nextDraftPickIdx) => {
    return useMemo(() => {
        if (allDraftPicks && nextDraftPickIdx >= 0) {
            return allDraftPicks[nextDraftPickIdx];
        }
        return null;
    }, [allDraftPicks, nextDraftPickIdx]);
};

export const GetPickTeamLogo = (league, draftPick, isRetro) => {
    return useMemo(() => {
        if (draftPick) {
            return getLogo(league, draftPick.TeamID, isRetro);
        }
        return null;
    }, [draftPick]);
};

export const GetViewablePlayersList = (
    allDraftablePlayers,
    selectedPositions,
    selectedColleges,
    selectedArchetypes,
    viewCount
) => {
    return useMemo(() => {
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
};

export const GetTradeWarRoom = (nflWarRoom, col) => {
    return useMemo(() => {
        let room = {};
        if (nflWarRoom && col && col.length > 0) {
            const roomIdx = col.findIndex((x) => x.id === nflWarRoom.Team);
            return col[roomIdx];
        }
        return room;
    }, [nflWarRoom, col]);
};
