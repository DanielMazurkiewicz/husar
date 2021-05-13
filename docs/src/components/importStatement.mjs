
import { div } from '../../../core.mjs';
import { style } from '../../../core.mjs';
import { text } from '../../../core.mjs';
import { span } from '../../../core.mjs';
import { code } from './code.mjs';
import { namedSection } from './namedSection.mjs';





export const importStatement = i => {
    const root = namedSection('Import statement:',
        code({
            example: `import { ${i.name} } from 'hussar/${i.module}';`
        })
    )
    return root;
}

