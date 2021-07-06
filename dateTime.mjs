"use strict"

import { UNDEFINED } from "./coreJs.mjs";

const fullDaysFactor = 86400000;
const date = new Date(0);

export const dateToDateTime = (input) => input * fullDaysFactor;
export const dateTimeToDate = (input) => input / fullDaysFactor;

export const Year = 0;
export const Month = 1;
export const Day = 2;
export const Hour = 3;
export const Minute = 4;
export const Second = 5;
export const Milliecond = 6;

export const dateTimeToString = (input, also = Year) => {
    if (isNaN(input))
        return UNDEFINED;
    date.setTime(input);
    const year = date.getUTCFullYear().toString().padStart(4, '0');
    if (also === Year)
        return year;
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    if (also === Month)
        return `${year}-${month}`;
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const dateToString = (input, also) => {
    if (isNaN(input))
        return UNDEFINED;
    return dateTimeToString(dateToDateTime(input), also);
};

export const stringToDateTime = (input, expect = Year) => {
    if (!input)
        return UNDEFINED;
    const splitted = input.split('-').filter(s => s.trim());
    if ((expect === Day) && (splitted.length < 3))
        return UNDEFINED;
    else if ((expect === Month) && (splitted.length < 2))
        return UNDEFINED;
    const asNumbers = splitted.map(s => parseInt(s));
    if (splitted[0].length < 4) {
        if (asNumbers[0] < 70) {
            asNumbers[0] += 2000;
        } else if (asNumbers[0] < 100) {
            asNumbers[0] += 1900;
        }
    }

    while (asNumbers.length < 3)
        asNumbers.push(1);
    
    if (asNumbers[1] < 1 || asNumbers[1] > 12)
        return UNDEFINED;
    
    if (asNumbers[2] < 1 || asNumbers[2] > 31)
        return UNDEFINED;
    
    asNumbers[1]--;
    date.setTime(0);
    date.setUTCFullYear(asNumbers[0]);
    date.setUTCMonth(asNumbers[1]);
    date.setUTCDate(asNumbers[2]);
    return date.getTime();
};

export const stringToDate = (input, expect) => {
    if (!input)
        return UNDEFINED;
    const value = stringToDateTime(input, expect);
    if (value === UNDEFINED)
        return UNDEFINED;
    return dateTimeToDate(value);
};

export const timeToString = (input, also = Hour, separator = '.') => {
    if (isNaN(input))
        return UNDEFINED;
    const date = new Date(input);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    let result = `${hours}:${minutes}`;
    if (also === Minute)
        return result;
    
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    result += `:${seconds}`;
    if (also === Second)
        return result;
    
    const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
    return `${result}${separator}${milliseconds}`;
};

export const stringToTime = (input, expect = Hour) => {
    if (!input)
        return UNDEFINED;
    
    const splitted = input.split(':').filter(s => s.trim());
    if (splitted.length < 2)
        return UNDEFINED;

    if ((expect === Second) && (splitted.length < 3))
        return UNDEFINED;
    
    const asNumbers = splitted.map(s => parseInt(s));
    while (asNumbers.length < 3)
        asNumbers.push(0);
    
    if (asNumbers[0] < 0 || asNumbers[0] > 23)
        return UNDEFINED;
    
    if (asNumbers[1] < 0 || asNumbers[1] > 59)
        return UNDEFINED;
    
    if (asNumbers[2] < 0 || asNumbers[2] >= 60)
        return UNDEFINED;
    
    date.setTime(0);
    date.setUTCHours(asNumbers[0]);
    date.setUTCMinutes(asNumbers[1]);
    date.setUTCSeconds(asNumbers[2]);
    return date.getTime();
};

export const getTimestamp = () => Date.now();