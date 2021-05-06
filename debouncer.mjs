"use strict"

export const DEBOUNCER_CANCEL     = 0;
export const DEBOUNCER_INSTANT    = 1;
export const DEBOUNCER_LATER      = 2;
export const DEBOUNCER_RUSH       = 3;


// RUSH - runs immediately if there is awaiting
// LATER - runs in specified amount of time
// CANCEL - cancels if there is anything ongoing
// INSTANT - runs immediately

export const runIfInactive = (callback, timeInMs = 30) => {
    const activator = (sureToActivate) => {
        const isAwaiting = activator.isAwaiting;
        if (isAwaiting) {
            clearTimeout(isAwaiting - 1);
            activator.isAwaiting = 0;
        }

        if (sureToActivate === DEBOUNCER_INSTANT || (isAwaiting && (sureToActivate === DEBOUNCER_RUSH))) {
            return callback();
        }
        if (sureToActivate === DEBOUNCER_CANCEL) {
            return;
        }

        activator.isAwaiting = setTimeout(()=> {
            activator.isAwaiting = 0;

            callback();
        }, timeInMs) + 1;            
    }
    return activator;
};
