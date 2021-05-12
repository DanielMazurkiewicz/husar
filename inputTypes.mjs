import { UNDEFINED } from "./core.mjs";

import { onKeyDown } from "./core.mjs";
import { onMouseUp } from "./core.mjs";
import { onContextMenu } from "./core.mjs";
import { TRUE } from "./core.mjs";
import { onInput } from "./core.mjs";
import { onDrop } from "./core.mjs";
import { onSelect } from "./core.mjs";
import { onMouseDown } from "./core.mjs";
import { onKeyUp } from "./core.mjs";

import { SoftEvent } from "./core.mjs";


const textInputUserChangeEventsList = 
[onInput, onKeyDown, onKeyUp, onMouseDown, onMouseUp, onSelect, onContextMenu, onDrop];
export const assignTextInputUserChangeEvents = (element, callback) => {
    let oldValue, oldSelectionStart, oldSelectionEnd;

    const eventProcessor = (evt) => {
        const target = evt.target;
        const value = target.value;

        if (value !== oldValue) {
            if (callback(value, oldValue, evt)) {
                oldSelectionStart = target.selectionStart;
                oldSelectionEnd = target.selectionEnd;    
            } else if (oldValue !== UNDEFINED) {
                target.value = oldValue;
                target.setSelectionRange(oldSelectionStart, oldSelectionEnd);
            }
            oldValue = value;
        }
    }

    for (let eventElement of textInputUserChangeEventsList) {
        eventElement(eventProcessor, element);
    }
}


// --=======================================================================================--

export const typeText = (element) => {
    element.s = (v = '') => {
        const old = element.value;
        // if (v.length > lengthMax) v = v.substr(0, lengthMax);
        if (v !== old) {
            element.value = v;
            element.onValueChange.raise(v, old, element);
        }
    }
    element.g = () => element.value;
    element.onValueChange = SoftEvent(element);
    assignTextInputUserChangeEvents(element, (v, old) => {
        element.onValueChange.raise(v, old, element);
        return TRUE;
    });
}




export const typeNumber = element => {

}