
import { div } from '../../../core.mjs';
import { text } from '../../../core.mjs';
import { span } from '../../../core.mjs';



export const description = d => {
    if (!d || !d.length) return;
    const root = div(...d.map(d => {
            switch (d.type) {
                case 'text':
                    return div(d.text);
                default:
                    return div('!!!UNDEFINED BEHAVIOUR!!! ' + JSON.stringify(d))
            }
        })
    );
    return root;
}