import { UNDEFINED } from "./core.mjs";

import { onKeyDown } from "./core.mjs";
import { onMouseUp } from "./core.mjs";
import { onContextMenu } from "./core.mjs";
import { TRUE } from "./core.mjs";
import { onChange } from "./core.mjs";
import { toBoolean } from "./core.mjs";
import { FALSE } from "./core.mjs";
import { setAttribute } from "./core.mjs";
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

export const typeCheckbox1 = (element) => {
    setAttribute(element, 'type', 'checkbox');

    element.s = (v) => {
        const old = element.checked;
        if (v !== old) {
            element.checked = v;
            element.onValueChange.raise(v, old, element);
        }
    }
    element.g = () => element.checked;
    element.onValueChange = SoftEvent(element);
    onCh

    assignTextInputUserChangeEvents(element, (v, old) => {
        element.onValueChange.raise(v, old, element);
        return TRUE;
    });
}


export const typeCheckbox = (element) => {
    setAttribute(element, 'type', 'checkbox');
    element.onValueChange = SoftEvent(element);
    
    let internalValue = FALSE;

    const setElementValue = () => {
        if (internalValue === UNDEFINED) {
            element.checked = FALSE;
            element.indeterminate = TRUE;
        } else {
            element.checked = internalValue;
            element.indeterminate = FALSE;
        }
    }

    element.s = (v) => {
        const internalValuePrevious = internalValue;
        internalValue = (v === UNDEFINED) ? UNDEFINED : toBoolean(v);
        if (internalValue !== internalValuePrevious) {
            setElementValue();
            element.onValueChange.raise(internalValue, internalValuePrevious, element);
        }
    }
    element.g = () => internalValue;

    const toggle = () => {
        if (!element.readOnly) {

            if (internalValue === UNDEFINED) {
                internalValue = TRUE;
            } else if (internalValue === TRUE) {
                internalValue = FALSE
            } else if (element.isTristate) {
                internalValue = UNDEFINED
            } else {
                internalValue = TRUE;
            }
            setElementValue();
        }
    };


    onChange(() => {
        const internalValuePrevious = internalValue;
        toggle();
        element.onValueChange.raise(internalValue, internalValuePrevious, element);
    }, element);

}


export const typeNumber = element => {

}