
import { div } from '../../../core.mjs';
import { style } from '../../../core.mjs';
import { text } from '../../../core.mjs';
import { span } from '../../../core.mjs';
import { mono_free } from '../../../fonts.mjs';
import { description } from './description.mjs';




const codeStyle = style({
    border: {
        style: 'solid',
        width: 0.1,
        color: 'lightgrey',
        radius: 0.2
    },
    padding: 0.2
});

const codeStyleCode = style({
    background: {
        color: 'lightgrey'
    },
    padding: 0.2,
    text: {
        font: mono_free,
        size: 0.8
    }
});

export const code = c => {
    const root = div(codeStyle,
        description(c.description),
        div(codeStyleCode, c.example)
    )
    return root;
}

