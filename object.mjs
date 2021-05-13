"use strict"

import { UNDEFINED } from "./core.mjs";
import { isObject } from "./core.mjs";

export const objectAssign = (...elements) => Object.assign(...elements);

export const objectDelete = (object, ...elements) => {
    const toDelete = objectAssign({}, ...elements);
    object = objectAssign({}, object);
    for (let name in toDelete) {
        delete object[name];
    }
    return object;
}

export const objectAssignIfDoesntExist = (object, ...elements) => {
    elements.forEach(e => {
        for (let name in e) {
            if (object[name] === UNDEFINED) object[name] = e[name];
        }    
    })
    return object;
}

export const objectToString = obj => JSON.stringify(obj);

export const deepCloneFastAndRough = obj => JSON.parse(JSON.stringify(obj))

export const deepClone = (obj) => {
    const clone = {};
    for(let i in obj) {
        if (isObject(obj[i]))
            clone[i] = deepClone(obj[i]);
        else
            clone[i] = obj[i];
    }
    return clone;
}