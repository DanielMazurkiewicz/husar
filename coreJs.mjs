
export const TRUE       = 1;
export const FALSE      = 0;
export const toBoolean  = value => value ? TRUE : FALSE;
// ================================================
export const UNDEFINED  = undefined;
export const NULL       = null;
// ================================================


export const isArray = tested => Array.isArray(tested);
export const isFunction = v => typeof v === 'function';
export const isObject = o => typeof o === 'object' && o !== null;
export const isString = (value) => typeof value === 'string';
export const isNumber = value => Number.isFinite(value);
export const isMap = object => object instanceof Map;
export const isCapitalLetter = letter => letter === letter.toUpperCase();
// ------------------------------------------------
export const makeArray = element => isArray(element) ? element : [element];
export const makeFirstCapital = text => text[0].toUpperCase() + text.substr(1);
export const makeEnumFromStringArray = arr => {
    const result = {};
    arr.forEach((e, i) => {
        if (isArray(e)) {
            e.forEach(el => result[el] = i + 1);
        } else {
            result[e] = i + 1;
        }
    });
    return result;
}
export const makeCharList = (...list) => {
    list = list.map(l => {
        if (isString(l)) {
            const newList = {};
            for (let i = 0; i < l.length; i++) {
                newList[l[i]] = 1;
            }
            return newList;
        }
        return l;
    });
    const result = Object.assign({}, ...list)
    return result; 
}
export const excludeFromCharList = (charList, ...listToExclude) => {
    charList = makeCharList(charList);
    listToExclude = makeCharList(...listToExclude);
    for (let char in listToExclude) {
        delete charList[char];
    }
    return charList;
}
// ================================================


// ################################################
// Events section
// ################################################

export const SoftEvent                  = (...fixedArgs) => {

//     const list = new Map();
//     return {
//         list,
//         add: (callback) => (list.set(callback, callback), callback),
//         del: (callback) => list.delete(callback),
//         raise: (...param) => list.forEach((callback) => callback( ...param, ...fixedArgs))
//     }

    const list = new Map();
    list.add = (callback) => (list.set(callback, callback), callback);
    list.del = list.delete;
    list.raise = (...param) => list.forEach((callback) => callback( ...param, ...fixedArgs));
    return list;
}
export const SoftEventSelective         = (...fixedArgs) => {
    const map = new Map();
    return {
        add: (obj, callback) => {
            let list
            if (map.has(obj)) {
                list = map.get(obj);
            } else {
                list = new Map();
                map.set(obj, list);
            }

            list.set(callback, callback)
            return callback;
        },

        del: (obj, callback) => {
            if (map.has(obj)) {
                const list = map.get(obj);
                list.delete(callback);
                if (!list.length) map.delete(obj);
            }
        },
        delAll: (obj) => map.delete(obj),
        raise: (obj, ...param) => {
            if (map.has(obj)) {
                const list = map.get(obj);
                list.forEach((callback) => callback(obj, ...param, ...fixedArgs))
            }
        }
    }
}

// ------------------------------------------------
