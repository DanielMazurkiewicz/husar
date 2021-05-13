
import { div } from '../../../core.mjs';
import { text } from '../../../core.mjs';
import { style } from '../../../core.mjs';
import { span } from '../../../core.mjs';
import { bulletpoint } from './bulletpoint.mjs';
import { method } from './method.mjs';
import { singleton } from './singleton.mjs';



const listStyle = style({
    margin: {
        left: 0.5
    }
});
export const list = l => {
    if (!l) return;

    const root = div(listStyle, ...l.map(e => {
        switch (e.kind) {
            case 'method':
                return method(e);
            case 'singleton':
                return singleton(e);
        }
    }).map(e => bulletpoint(e)));
    return root;
}

