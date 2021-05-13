
import { div } from '../../../core.mjs';
import { style } from '../../../core.mjs';
import { text } from '../../../core.mjs';
import { span } from '../../../core.mjs';
import { namedSection } from './namedSection.mjs';
import { code } from './code.mjs';




export const usageList = l => {
    if (!l || !l.length) return;

    const root = namedSection('Usage:',
        ...l.map(u => code(u))
    )
    return root;
}

