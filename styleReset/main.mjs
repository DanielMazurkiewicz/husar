
import { style } from "../core.mjs"

const styleMainHtml = style({
    selector:                   'html',
    fontSize:                   1,
    whiteSpace:                 'pre-wrap',
    lineHeight:                 `1.15`,
    _webkitTextSizeAdjust:      `100%`
});

const styleMainBody = style({
    selector:                   'body',
    height:                     `100vh`
});

const styleMainAll = style({
    selector:                   '*',
    boxSizing:                  'border-box',
    margin:                     0,
    padding:                    0,

	font:                       'inherit',

    overflow:                   'auto',
    // scrollbarColor:             'lightgrey rgba(0,0,0,0)',
    userSelect:                 'none',
});


