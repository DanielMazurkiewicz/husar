"use strict"

import { makeCharList } from "./coreJs.mjs";

export const stringJoin = (elements, delimiter) => elements.join(delimiter);
export const stringDataFormat = (mime, content, encoding = 'utf8') => `data:${mime};${encoding},` + content;

export const urlToString = text => decodeURIComponent(text);


export const stringToObject = text => JSON.parse(text);
export const stringToUrl = text => encodeURIComponent(text);


const emptyChar = makeCharList(' \t');
const newLineChar = makeCharList('\n\r');
const emptyOrNewLineChar = makeCharList(emptyChar, newLineChar);

export const stringUnfold = text => {
    let result = [], previousChar = '';
    let spaceStart = -1;
    let skipSpacesMode = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (spaceStart < 0 && emptyOrNewLineChar[char] && !emptyOrNewLineChar[previousChar]) {
            spaceStart = i;
        }
        if (newLineChar[char]) {
            skipSpacesMode = 1;
            if (spaceStart < 0) spaceStart = i;
        }

        if (!emptyOrNewLineChar[char] && emptyOrNewLineChar[previousChar]) {
            if (skipSpacesMode) {
                result.length && result.push(' ');
                skipSpacesMode = 0;
            } else {
                result.length && result.push(text.substring(spaceStart, i));
            }
            spaceStart = -1;
        }

        if (!emptyOrNewLineChar[char]) result.push(char)

        previousChar = char;
    }
    return result.join('');
}