"use strict"

import { settings } from "./settings";
import { UNDEFINED } from "./core.mjs";
import { isNumber } from "./core.mjs";

export const numberToString = (num, decimals = 0, separator = settings.numberSeparator) => {

   if (isNaN(num) || typeof num === 'string') return UNDEFINED;
   const str = decimals < 0 ? `${num}` : num.toFixed(decimals);

   const splitted = str.split('.');
   let integerPart = splitted[0];
   let sign = '';
   if (integerPart.startsWith('-')) {
       integerPart = integerPart.substr(1);
       sign = '-';
   }

   const tripplets = [];
   while (integerPart.length) {
       let cutOff = integerPart.length - 3;
       if (cutOff < 0) cutOff = 0;
       tripplets.unshift(integerPart.substr(cutOff));
       integerPart = integerPart.substr(0, cutOff);
   }

   let result =  `${sign}${tripplets.join(' ')}`;
   if (!decimals || !splitted[1]) return result;
   return `${result}${separator}${splitted[1]}`
};

export const stringToNumber = (str) => {
   const result = parseFloat(str.replace(/\s/g, '').replace(/\,/g, '.'));
   return isNumber(result) ? result : UNDEFINED;
};

export const MAX_I32 =  (2**31) - 1;
export const MIN_I32 = -(2**31);
export const MAX_FLOAT = Number.POSITIVE_INFINITY;
export const MIN_FLOAT = Number.NEGATIVE_INFINITY;