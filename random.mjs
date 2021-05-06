import { wnd } from "./core.mjs";
import { numberToBase93 } from "./base93.mjs"

export const crypto = wnd.crypto;

export const getRandomBuffer = (numOf, bytes = true) => {
    const elements = Math.ceil(numOf / (bytes ? 1 : 8));
    const randoms = new Uint8Array(elements);
    crypto.getRandomValues(randoms);
    return randoms;
}

export const getRandomString = (numOf, characters = true) => {
    const elements = Math.ceil(numOf / (characters ? 1 : 6.539));
    const randoms = new Uint16Array(elements);
    crypto.getRandomValues(randoms);

    let result = '';
    for (let i = 0; i < elements; i++) {
        result += numberToBase93(randoms[i])
    }
    return result;
}
