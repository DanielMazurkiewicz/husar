
import { div } from '../../../core.mjs';
import { style } from '../../../core.mjs';
import { text } from '../../../core.mjs';
import { span } from '../../../core.mjs';
import { namedSection } from './namedSection.mjs';


export const parametersShort = params => {
    if (!params) return text('()');
    const root = span('(', params.map(p => p.name).join(', '), ')');
    return root;
}

const parametersStyle = style({
    border: {
        left: {
            style: 'solid',
            width: 0.2,
            color: 'lightblue',
        }
    },
    padding: {
        left: 0.2
    },
    margin: {
        left: 0.2
    }
});

export const parameters = params => {
    if (!params || !params.length) return;
    const root = namedSection('Parameters:', 
        div(
            parametersStyle,
            ...params.map(p => div(p.name, ": ", p.type))
        )
    );
    return root;

}
