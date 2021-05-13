
import { div } from '../../../core.mjs';
import { style } from '../../../core.mjs';
import { separateElementArgs } from '../../../core.mjs';
import { text } from '../../../core.mjs';
import { span } from '../../../core.mjs';
import { directionRow } from '../../../styles.mjs';





export const bulletpoint = (...elements) => {
    const args = separateElementArgs(elements);
    const root = div( directionRow, ...args.operations,
        span('→ '), span(...args.other)
    );
    return root;
}

