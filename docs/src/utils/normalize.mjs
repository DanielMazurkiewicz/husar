

import { isString }                     from '../../../core.mjs';
import { makeArray }                    from '../../../core.mjs';
import { stringUnfold }                 from '../../../string.mjs';
import { objectDelete }                 from '../../../object.mjs';
import { objectAssignIfDoesntExist }    from '../../../object.mjs';


const unfoldDescriptionFromString = description => {
    if (isString(description)) {
        description = {
            type: 'text',
            text: description,
        }
    }
    return description;
}
const unfoldDescription = description => {
    description = makeArray(description);
    description = description.map(unfoldDescriptionFromString);
    description.forEach(d => {
        if (d.text) d.text = stringUnfold(d.text);
    })
    return description;
}

const toDeleteForSharedProperties = {
    list: 1,
    description: 1,
    title: 1,
}
export const normalizeDocObject = element => {
    const sharedProperties = objectDelete(element, toDeleteForSharedProperties);

    if (element.description) element.description = unfoldDescription(element.description);
    if (element.list) {
        element.list.forEach(e => {
            if (e.description) e.description = unfoldDescription(e.description);
            objectAssignIfDoesntExist(e, sharedProperties);
            if (e.params) {
                e.params = makeArray(e.params);
                e.params = e.params.map(p => isString(p) ? {name: p} : p);
                e.params.forEach(p => {
                    if (p.description) p.description = unfoldDescription(p.description);
                });
            }

            if (e.usage) {
                e.usage = makeArray(e.usage);
                e.usage = e.usage.map(u => isString(u) ? {example: u} : u);
                e.usage.forEach(u => {
                    if (u.description) u.description = unfoldDescription(u.description);
                })
            }

            if (e.returns && e.returns.description) e.returns.description = 
                unfoldDescription(e.returns.description); 
        })
    }

    return element;
}

