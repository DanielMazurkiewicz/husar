
import { div } from '../../../core.mjs';
import { style } from '../../../core.mjs';
import { text } from '../../../core.mjs';
import { span } from '../../../core.mjs';
import { directionRow } from '../../../styles.mjs';
import { description } from './description.mjs';
import { namedSection } from './namedSection.mjs';


export const returns = r => {
    if (!r) return;

    const root = namedSection('Returns:',
        div(directionRow,
            span(r.type, r.description && ': '),
            description(r.description)
        )
    )
    return root;
}

