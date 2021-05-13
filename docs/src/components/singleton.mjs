
import { div } from '../../../core.mjs';
import { style } from '../../../core.mjs';
import { text } from '../../../core.mjs';
import { span } from '../../../core.mjs';
import { description } from './description.mjs';
import { importStatement } from './importStatement.mjs';
import { usageList } from './usageList.mjs';




const singletonStyleName = style({
    text: {
        weight: 'bold',
        color:  'darkgreen'
    }
});

export const singleton = s => {
    const root = div(
        div(singletonStyleName, s.name),
        description(s.description),
        importStatement(s),
        usageList(s.usage),
    );
    return root;
}
