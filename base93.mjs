// BASE 99
// char excluded: 34 - "
// char excluded: 92 - \
// char codes range: <32 to 126>

export const base93ToNumber = char => {
    let code = char.charCodeAt(0);
    if (code > 34) code--;
    if (code > 92) code--;
    code -= 32;
    return code;
}

export const numberToBase93 = number => {
    number = number % 93;
    number += 32;
    if (number >= 34) number++;
    if (number >= 92) number++;
    return String.fromCharCode(number)
}
