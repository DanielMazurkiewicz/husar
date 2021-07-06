import { makeCharList } from "../coreJs.mjs";
import { UNDEFINED } from "../coreJs.mjs";
import { isArray } from "../coreJs.mjs";
import { TRUE } from "../coreJs.mjs";
import { excludeFromCharList } from "../coreJs.mjs";
import { isString } from "../coreJs.mjs";
import { tokenizerKey } from "../tokenizer.mjs";
import { TokenizeSync } from "../tokenizer.mjs";
import { tokenizerExec } from "../tokenizer.mjs";
import { TokenizerScheme } from "../tokenizer.mjs";


const commentSingleEndingChars = makeCharList('\n\r');
const commentSingle = (text, start, pos, tokenKindId, currentRoot, tokens) => {
    for (let i = pos; i < text.length; i++) {
        const char = text[i];

        if (commentSingleEndingChars[char]) {
            tokens.push({
                kindId: tokenKindId,
                token: text.substring(pos, i),
                type: 'single'
            })
            return i;
        }
    }

    tokens.push({
        kindId: tokenKindId,
        token:  text.substring(pos),
        type: 'single'
    });

    return text.length;

}

const commentMulti = () => {

}

const string = (text, start, pos, tokenKindId, currentRoot, tokens) => {
    const op = text.substring(start, pos);

    for (let i = pos; i < text.length; i++) {
        const char = text[i];

        if (char === '\\') {
            // TODO: support for unicode characters: \u
            i++;
        } else if (char === op) {
            tokens.push({
                kindId: tokenKindId,
                token: text.substring(pos, i),
                op,
            })
            return i + 1;
        }
    }

    tokens.push({
        kindId: tokenKindId,
        token:  text.substring(pos),
        op,
    });

    return text.length;
}


const digitBinaryChars = makeCharList('01');
const digitOctalChars = makeCharList(digitBinaryChars, '234567');
const digitChars = makeCharList(digitOctalChars, '89');
const digitNonZeroChars = excludeFromCharList(digitChars, '0');
const digitHexChars = makeCharList(digitChars, 'abcdefABCDEF');
const digitEChars = makeCharList('eE');
const digitAllowedChars = makeCharList('.', digitEChars, digitChars);
// const digitPlusMinusChars = makeCharList('+-');
const digitAllowedEChars = makeCharList('+-', digitChars);


const numberPrefixed = (charLimiter) => (text, start, pos, tokenKindId, currentRoot, tokens) => {
    const op = text.substring(start, pos);

    for (let i = pos; i < text.length; i++) {
        const char = text[i];

        if (!charLimiter[char]) {
            tokens.push({
                kindId: tokenKindId,
                token: text.substring(pos, i),
                op,
            })
            return i;
        }
    }

    tokens.push({
        kindId: tokenKindId,
        token:  text.substring(pos),
        op,
    });

    return text.length;
}

const numberBinary = numberPrefixed(digitBinaryChars);
const numberOctal = numberPrefixed(digitOctalChars);
const numberHex = numberPrefixed(digitHexChars);


const number = (text, start, pos, tokenKindId, currentRoot, tokens) => {
    let qualificator = digitAllowedChars, dot=0, op;

    for (let i = start; i < text.length; i++) {
        const char = text[i];
        if (char === '.') {
            dot++;
        }

        if (!qualificator[char] || dot > 1) {
            tokens.push({
                kindId: tokenKindId,
                token: text.substring(start, i),
                op,
                hasDot: dot ? 1:0,
            })
            return i;
        }

        // only first char can contain plus/minus char
        if (qualificator === digitAllowedEChars) {
            qualificator = digitChars;
        }

        // change qualificator for next char if number is in E notation
        if (digitEChars[char]) {
            qualificator = digitAllowedEChars;
            op = 'E';
        }
    }

    tokens.push({
        kindId: tokenKindId,
        token:  text.substring(start),
        op,
        hasDot: dot ? 1:0,
    });

    return text.length;
}

const spaceChars = makeCharList(' \t');
const space = (text, start, pos, tokenKindId, currentRoot, tokens) => {
    for (let i = pos; i < text.length; i++) {
        const char = text[i];

        if (!spaceChars[char]) {
            tokens.push({
                kindId: tokenKindId,
                token: text.substring(start, i),
            })
            return i;
        }
    }

    tokens.push({
        kindId: tokenKindId,
        token:  text.substring(start),
    });

    return text.length;
}


const specialChars = makeCharList('~`!@#$%^&*()_-+={[}]|\\:;"\'<,>.?/ \n\t\r');
const name = (text, start, pos, tokenKindId, currentRoot, tokens) => {
    for (let i = pos; i < text.length; i++) {
        const char = text[i];

        if (specialChars[char]) {
            if (pos === i) return;
            tokens.push({
                kindId: tokenKindId,
                token: text.substring(start, i),
            })
            return i;
        }
    }

    if (pos === i) return;
    tokens.push({
        kindId: tokenKindId,
        token:  text.substring(start),
    });

    return text.length;
}



export const javascriptScheme = TokenizerScheme({
    NAME:           tokenizerFallback(name),

    BIT:            ['&', '|', '^', '>>', '>>>', '<<'],
    BIT_SINGLE:     ['~'],

    LOGIC:          ['&&', '||', '^^', '??'],
    LOGIC_SINGLE:   ['!'],

    MATH:           ['*', '/', '+', '-', '%', '**'],
    MATH_SINGLE:    ['++', '--'],

    COMPARE:        ['==', '>', '<', '>=', '<=', 
                    '!=', '!==', '==='],

    ASSIGN:         '=',

    SPREAD:         '...',
    OPTIONAL_CHAIN: '.?',
    CHAIN:          '.',
    SEPARATOR:      ',',
    TERMINATOR:     ';',
    COLON:          ':',

    OPENING:        ['(', '{', '['],
    CLOSING:        [')', '}', ']'],


    COMMENT:        [
                        tokenizerExec('//', commentSingle),
                        tokenizerExec('/*', commentMulti)
                    ],
    STRING:         tokenizerExec(makeCharList('`"\''), string),
    SPACE:          tokenizerExec(spaceChars, space),
    NUMBER:         [
                        tokenizerExec('0b', numberBinary),
                        tokenizerExec('0o', numberOctal),
                        tokenizerExec('0x', '0X', numberHex),
                        
                        tokenizerExec(digitNonZeroChars, 
                            '0.', '0e', '0E', 
                            '00', '01','02', '03', '04', '05', '06', '07', '08', '09',
                            '.0', '.1','.2', '.3', '.4', '.5', '.6', '.7', '.8', '.9',
                            
                            number
                        )
                    ],


    IGNORE:         '\r',

    NEW_LINE:       '\n',

    AWAIT:          tokenizerKey('await'),
    BREAK:          tokenizerKey('break'),
    CASE:           tokenizerKey('case'),
    CATCH:          tokenizerKey('catch'),
    CLASS:          tokenizerKey('class'),
    CONST:          tokenizerKey('const'),
    CONTINUE:       tokenizerKey('continue'),
    DEBUGGER:       tokenizerKey('debugger'),
    DEFAULT:        tokenizerKey('default'),
    DELETE:         tokenizerKey('delete'),
    DO:             tokenizerKey('do'),
    ELSE:           tokenizerKey('else'),
    ENUM:           tokenizerKey('enum'),
    EXPORT:         tokenizerKey('export'),
    EXTENDS:        tokenizerKey('extends'),
    FALSE:          tokenizerKey('false'),
    FINALLY:        tokenizerKey('finally'),
    FOR:            tokenizerKey('for'),
    FUNCTION:       [tokenizerKey('function'), '=>'],
    IF:             [tokenizerKey('if'), '?'],
    IMPLEMENTS:     tokenizerKey('implements'),
    IMPORT:         tokenizerKey('import'),
    IN:             tokenizerKey('in'),
    INSTANCEOF:     tokenizerKey('instanceof'),
    INTERFACE:      tokenizerKey('interface'),
    LET:            tokenizerKey('let'),
    NEW:            tokenizerKey('new'),
    NULL:           tokenizerKey('null'),
    PACKAGE:        tokenizerKey('package'),
    PRIVATE:        tokenizerKey('private'),
    PROTECTED:      tokenizerKey('protected'),
    PUBLIC:         tokenizerKey('public'),
    RETURN:         tokenizerKey('return'),
    SUPER:          tokenizerKey('super'),
    SWITCH:         tokenizerKey('switch'),
    STATIC:         tokenizerKey('static'),
    THIS:           tokenizerKey('this'),
    THROW:          tokenizerKey('throw'),
    TRY:            tokenizerKey('try'),
    TRUE:           tokenizerKey('true'),
    TYPEOF:         tokenizerKey('typeof'),
    VAR:            tokenizerKey('var'),
    VOID:           tokenizerKey('void'),
    WHILE:          tokenizerKey('while'),
    WITH:           tokenizerKey('with'),
    YIELD:          tokenizerKey('yield'),

})



const code = `
123.34.55
0x2aFg
10.1e-130;
"aaa\\"ccc"
'bbb\\'ddd'
const space = (text, start, pos, tokenKindId, currentRoot, tokens) => {
    for (let i = pos; i < text.length; i++) {
        const char = text[i];

        if (!spaceChars[char]) {
            tokens.push({
                kindId: tokenKindId,
                token: text.substring(pos, i),
            })
            return i;
        }
    }

    tokens.push({
        kindId: tokenKindId,
        token:  text.substring(pos),
    });

    return text.length;

}

`

console.log(javascriptScheme)

console.log(
    TokenizeSync(code, javascriptScheme)
)