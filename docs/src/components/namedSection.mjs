
import { div } from '../../../core.mjs';
import { style } from '../../../core.mjs';
import { separateElementArgs } from '../../../core.mjs';
import { text } from '../../../core.mjs';
import { span } from '../../../core.mjs';




const sectionHeaderStyle = style({
    text: {
        color: '#00001a',
        size: 0.8,
        weight: 'bold'
    }
});


export const namedSection = (sectionName, ...elements) => {
    const args = separateElementArgs(elements);
    const root = div(...args.operations,
        div(sectionHeaderStyle, sectionName),
        ...args.other
    );
    return root;
}