
import { style } from "../core.mjs"

const none = 'none';

const styleInput = style({
    selector:                   'input,textarea,select,option',

    border:                     none,
    background:                 none,

    userSelect:                 'auto',
    color:                      'inherit',

    // for "select" elements:
    appearance:                 none,
});

const styleInputFocus = style({
    selector:                   'input:focus,textarea:focus,select:focus',
    outline:                    none,
});

