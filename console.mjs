import { TRUE } from "./coreJs.mjs"
import { SoftEvent } from "./coreJs.mjs"
import { UNDEFINED } from "./coreJs.mjs"
import { isString } from "./coreJs.mjs"

export const console_colors = {
    black: 0,
    red: 1,
    green: 2,
    yellow: 3,
    blueDark: 4,
    pink: 5,
    blue: 6,
    white: 7,
    none: 8,
}


export const console_brightnessBackground = {
    '0': 100, // light
    '1': 40   // dark
}

export const console_brightnessText = {
    '0': 90,  // light
    '1': 30   // dark
}

export const console_fontStyle = {
    normal: 0,
    bold: 1,
    thin: 2,
    italic: 3,
    underline: 4,
    blink: 5,
    
    inverted: 7,
    invisible: 8,
    crossed: 9,
    cool: 20,
    digits: 52,
}

export const console_brightness = {
    light: 0,  // light
    dark: 1   // dark
}


const processProperty = (propContent) => {
    if (isString(propContent)) {
        const obj = {}
        propContent = propContent.split(' ').filter(a => a).forEach(element => {
            if (console_colors[element] !== UNDEFINED) {
                obj.color = element;
            } else if (console_brightness[element] !== UNDEFINED) {
                obj.brightness = element;
            } else {
                obj[element] = true;
            }
        });
        propContent = obj;
    }
    
    if (propContent.color !== UNDEFINED) {
        if (isString(propContent.color)) {
            propContent.color = console_colors[propContent.color] || 0;
        }
    }

    if (propContent.brightness !== UNDEFINED) {
        if (isString(propContent.brightness)) {
            propContent.brightness = console_brightness[propContent.brightness] || 0;
        }
    }
    return propContent;
}

export const console_style = ({text, background}) => {
    let styleText = '';
    const style = (text) => `\x1b[${styleText}m${text}\x1b[0m`;
    style.isConsoleStyle = TRUE;


    const stylesList = [];

    if (text !== UNDEFINED) {
        text = processProperty(text);

        for (let name in text) {
            const value = text[name];
            if (name === 'color') {
                if (text.brightness !== UNDEFINED) {
                    stylesList.push(value + console_brightnessText[text.brightness])
                } else {
                    stylesList.push(value + console_brightnessText['1'])
                }
            } else {
                const fontStyle = console_fontStyle[name];
                if (fontStyle !== UNDEFINED) {
                    stylesList.push(fontStyle)
                }
            }
    
        }
    }


    if (background !== UNDEFINED) {
        background = processProperty(background);

        for (let name in background) {
            const value = background[name];
            if (name === 'color') {
                if (background.brightness !== UNDEFINED) {
                    stylesList.push(value + console_brightnessBackground[background.brightness])
                } else {
                    stylesList.push(value + console_brightnessBackground['1'])
                }
            }
        }
    }


    styleText = stylesList.join(';');
    console_log(styleText, text, background)

    return style;
}

const 
    right = '\x1B[C', 
    up = '\x1B[A', 
    left = '\x1B[D', 
    down = '\x1B[B', 
    home = '\x1B[H',
    newLine = '\n'

// -------------------------------------------------------------------
const write = (text) => process.stdout.write(text);


export const console_newline = () => write('\n');
export const console_moveToTopLeft = () => write(home);
export const console_resize = (x, y) => write(`\x1B[8;${x};${y}t`);
export const console_moveBy = (x, y) => {
    if (x) {
        if (x < 0) {
            x = -x;
            write(`\x1B[${x > 1 ? x : ''}A`)
        } else {
            write(`\x1B[${x > 1 ? x : ''}B`)
        }
    }

    if (y) {
        if (y < 0) {
            y = -y;
            write(`\x1B[${y > 1 ? y : ''}D`)
        } else {
            write(`\x1B[${y > 1 ? y : ''}C`)
        } 
    }
}
export const console_moveTo = (x = 0, y = 0) => {
    if (!x && !y) {
        console_moveToTopLeft()
    } else {
        write(`\x1B[${y + 1};${x + 1}H`)
    } 
}
export const console_moveToBottomRight = () => {
    console_moveTo(999, 999)
}

let console_getPosition_isProcessing = 0;
export const console_getPosition = (callback) => {
    if (!console_getPosition_isProcessing) write(`\x1B[6n`);
    console_getPosition_isProcessing++;
    const event = (x, y) => {
        console_getPosition_isProcessing--;
        console_onPosition.del(event); // just do it once  
        callback(x, y);
    };
    console_onPosition.add(event);
}
// -------------------------------------------------------------------

export const console_inline = (...args) => {
    for (let i = 0; i < args.length; i++) {
        write(args[i]);
    }
}
export const console_line = (...args) => {
    console_inline(...args, newLine);
}

export const console_noSpaces = {};
export const console_spaces = {};
export const console_noNewLine = {};


export const console_log = (...args) => {
    let spacesInbetween = TRUE;
    let notFirst, noNewLine, styleToApply;

    const writeText = text => {
        if (notFirst && spacesInbetween) write(' ')
        if (styleToApply) {
            write(styleToApply(text))
            styleToApply = UNDEFINED;
        } else {
            write(text);
        }
        notFirst = TRUE;
    }

    for (let i = 0; i < args.length; i++) {
        let arg = args[i];
        if (arg === console_spaces) {
            spacesInbetween = TRUE;
        } else if (arg === console_noSpaces) {
            spacesInbetween = FALSE;        
        } else if (arg === console_noNewLine) {
            noNewLine = TRUE;        
        } else if (arg === UNDEFINED) {
            writeText('undefined');
        } else if (arg === null) {
            writeText('null');
        } else if (arg.isConsoleStyle) {
            styleToApply = arg;
        } else if (isString(arg)) {
            writeText(arg);
        } else {
            arg = JSON.stringify(arg, null, 3);
            writeText(arg);
        }
    }
    if (!noNewLine) write('\n');
}

// -------------------------------------------------------------------
// on cursor position received
export const console_onPosition = SoftEvent();

// -------------------------------------------------------------------


const twoCharsCommandContent = (data) => data.substring(2, data.length - 1);
const twoCharsCommands = {
    '\x1B[': {
        '': (data) =>  {
            console_log(data)
        },
        R: (data) => {
            const [y, x] = twoCharsCommandContent(data).split(';')
            console_onPosition.raise(parseInt(y-1), parseInt(x-1));
        }
    }
}

const fullDataCommands = {
    '': (data) => {
        console_log(data)
    },
    '\u0003': (data) => {
        process.exit();
    }
}



// -------------------------------------------------------------------
let console_input;
export const console_enablaDataInput = () => {
    if (!console_input) {
        console_input = process.stdin;

        // without this, we would only get streams once enter is pressed
        console_input.setRawMode( true );
        
        // resume stdin in the parent process (node app won't quit all by itself
        // unless an error or process.exit() happens)
        console_input.resume();
        
        // i don't want binary, do you?
        console_input.setEncoding( 'utf8' );


        console_input.on('data', ( data ) => {
            const twoChars = data.substr(0, 2);
            const cmdGroup = twoCharsCommands[twoChars];
            if (cmdGroup) {
                const lastChar = data[data.length - 1];
                const cmd = cmdGroup[lastChar] || cmdGroup[''];
                cmd(data);
                return;
            }
            const fullDataCmd = fullDataCommands[data] || fullDataCommands[''];
            fullDataCmd(data);

        });

    }
}