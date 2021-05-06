"use strict"


export const addToArray = (array, elementOrArray) => {
    if (isArray(elementOrArray)) {
        array.push(...elementOrArray);
    } else {
        array.push(elementOrArray);
    }
}
export const toArray = (element) => isArray(element) ? element : [element];
export const arrayForEach = (array, callback) => {
    for (let i = 0; i < array.length; i++) {
        callback(array[i], i)
    }
}
export const arrayForEachRev = (array, callback) => {
    let i = array.length - 1;
    while (i >= 0) {
        callback(array[i], i)
        i--;
    }
}
