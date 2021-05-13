
import { div } from '../../../core.mjs';
import { text } from '../../../core.mjs';
import { style } from '../../../core.mjs';
import { span } from '../../../core.mjs';
import { description } from './description.mjs';
import { list } from './list.mjs';




const docDbStyleTitle = style({
    text: {
        size: 1.5,
    }
});


export const docDb = db => {
    const root = div(
        div(docDbStyleTitle, db.title),
        description(db.description),
        list(db.list)
    )
    return root;
}



