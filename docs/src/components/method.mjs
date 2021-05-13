
import { div } from '../../../core.mjs';
import { style } from '../../../core.mjs';
import { text } from '../../../core.mjs';
import { span } from '../../../core.mjs';
import { description } from './description.mjs';
import { importStatement } from './importStatement.mjs';
import { parameters } from './parameters.mjs';
import { parametersShort } from './parameters.mjs';
import { returns } from './returns.mjs';
import { usageList } from './usageList.mjs';



const methodStyleName = style({
    text: {
        weight: 'bold',
        color:  'darkblue'
    }
});

export const method = m => {
    const root = div(
        div(span(methodStyleName, m.name), parametersShort(m.params)),
        description(m.description),
        parameters(m.params),
        returns(m.returns),
        importStatement(m),
        usageList(m.usage)
    )
    return root;
}

