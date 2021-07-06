import { runIfInactive } from "./debouncer.mjs";
import {
    TRUE,
    FALSE,
    UNDEFINED,
    NULL,
    isArray,
    isFunction,
    isObject,
    isString,
    isNumber,
    isMap,
    isCapitalLetter,
    makeArray,
    makeFirstCapital,
    makeEnumFromStringArray,
    makeCharList,
    excludeFromCharList,
    SoftEvent,
    SoftEventSelective,
} from './coreJs.mjs';

export * from './coreJs.mjs';


export const wnd        = window;
export const doc        = document;
export const docStyle   = /*@__PURE__*/doc.getElementsByTagName('style')[0];
export const bodyNative = doc.body;

bodyNative.isAttachedToDOM = /*@__PURE__*/TRUE;
bodyNative.isLifecycleTracked = /*@__PURE__*/TRUE;
bodyNative.onLifecycleListeningChildren = /*@__PURE__*/new Map();    

// ================================================
export const parentNode = element => element.parentNode;
export const previousNode = element => element.previousSibling;
export const nextNode = element => element.nextSibling;
export const firstNode = element => element.firstChild;
// ================================================
export const setAttribute = (element, attribute, value) => element.setAttribute(attribute, value);
export const getAttribute = (element, attribute) => element.getAttribute(attribute);
export const removeAttribute = (element, attribute) => element.removeAttribute(attribute);
// ------------------------------------------------
export const placeholder = (text, el) => element => setAttribute(element || el, 'placeholder', text);
export const href = (text, el) => element => setAttribute(element || el, 'href', text);
export const src = (text, el) => element => setAttribute(element || el, 'src', text);
export const _id_ = (text, el) => element => setAttribute(element || el, 'id', text);


// ################################################
// Events section
// ################################################


export const addEvent_raw               = (element, eventName, eventListener) => element.addEventListener(eventName, eventListener);
export const removeEvent_raw            = (element, eventName, eventListener) => element.removeEventListener(eventName, eventListener);

export const preventDefault             = event => event.preventDefault();
export const stopPropagation            = event => event.stopPropagation();
export const stopImmediatePropagation   = event => event.stopImmediatePropagation();
export const getEventPath               = event => event.composedPath();

// ------------------------------------------------
const eventAdd                          = (element, eventObject) => {
    addEvent_raw(element, eventObject.__name__, eventObject.__listener__)
}
// ------------------------------------------------

export const createEvent = (eventName) => {
    const event = (eventListener, optionalElement) => {
        if (optionalElement) {
            addEvent_raw(optionalElement, eventName, eventListener);
        } else {
            return {
                __op__:         OP_EVENT,
                __name__:       eventName,
                __listener__:   eventListener
            }
        }
    }
    event.remove = (element, eventListener) => removeEvent_raw(element, eventName, eventListener);
    return event;
}

export const onChange =         /*@__PURE__*/createEvent(`change`);
export const onClick =          /*@__PURE__*/createEvent(`click`);
export const onInput =          /*@__PURE__*/createEvent(`input`);
export const onKeyDown =        /*@__PURE__*/createEvent(`keydown`);
export const onKeyUp =          /*@__PURE__*/createEvent(`keyup`);
export const onKeyPress =       /*@__PURE__*/createEvent(`keypress`);
export const onMouseDown =      /*@__PURE__*/createEvent(`mousedown`);
export const onMouseUp =        /*@__PURE__*/createEvent(`mouseup`);
export const onMouseMove =      /*@__PURE__*/createEvent(`mousemove`);
export const onSelect =         /*@__PURE__*/createEvent(`select`);
export const onContextMenu =    /*@__PURE__*/createEvent(`contextmenu`);
export const onDrop =           /*@__PURE__*/createEvent(`drop`);

export const onFocus =          /*@__PURE__*/createEvent(`focus`);
export const onFocusIn =        /*@__PURE__*/createEvent(`focusin`);  // bubbles
export const onFocusOut =       /*@__PURE__*/createEvent(`focusout`); // bubbles
export const onBlur =           /*@__PURE__*/createEvent(`blur`);
export const onWndResize =      /*@__PURE__*/createEvent(`resize`);


// -----------------------------------------------------------------

export const LIFECYCLE_DETACHED = 0;
export const LIFECYCLE_ATTACHED = 1;

// -----------------------------------------------------------------
const isLifecycleObject = e => 
    (e.isAttachedToDOM !== UNDEFINED) ||
    (e.isLifecycleTracked !== UNDEFINED) ||
    (e.onLifecycle !== UNDEFINED) ||
    (e.onLifecycleListeningChildren !== UNDEFINED)
const getLifecycleDebugObject = (currentDOMelement, element) => (
    isLifecycleObject(currentDOMelement) ?
    {
        isAttachedToDOM: currentDOMelement.isAttachedToDOM,
        isLifecycleTracked: currentDOMelement.isLifecycleTracked,
        onLifecycleListeningChildren: currentDOMelement.onLifecycleListeningChildren,
        onLifecycle: currentDOMelement.onLifecycle,
        parent: element,
        element: currentDOMelement
    }
    :
    {
        parent: element,
        element: currentDOMelement 
    }
)
// -----------------------------------------------------------------

const onLifecycle_CheckIfParentsAttachedToDOM = (element, child) => {
    const isAttachedToDOM =
        forEachParent(element, e => {
            if (e.isLifecycleTracked) return e.isAttachedToDOM;
        }, TRUE);

    forEachParent(element, e => {
        e.isAttachedToDOM = isAttachedToDOM;
        if (e.onLifecycleListeningChildren === UNDEFINED) e.onLifecycleListeningChildren = new Map();
        e.onLifecycleListeningChildren.set(child, child);
        if (e.isLifecycleTracked) return e;
        e.isLifecycleTracked = TRUE;
        child = e;
    }, TRUE);

    return isAttachedToDOM;
}
const onLifecycle_UpdateElementAndParentsDueToRemoval = (element) => {
    if (
        (!element.onLifecycle || !element.onLifecycle.size) &&
        (!element.onLifecycleListeningChildren || !element.onLifecycleListeningChildren.size)
    ) {
        element.isLifecycleTracked = FALSE;

        let child = element;
        forEachParent(element, e => {
            if (e.onLifecycleListeningChildren) {
                e.onLifecycleListeningChildren.delete(child);
            }
    
            if (e === bodyNative) return TRUE;
    
            if (
                (!e.onLifecycle || !e.onLifecycle.size) &&
                (!e.onLifecycleListeningChildren || !e.onLifecycleListeningChildren.size)
            ) {
                e.isLifecycleTracked = FALSE;
            } else {
                return TRUE;
            }
            child = e;
        });

    }
}
export const onLifecycle = (eventListener, optionalElement) => {
    const event = (element) => {
        if (!element.onLifecycle) element.onLifecycle = SoftEvent(element);
        element.onLifecycle.add(eventListener);
        element.isLifecycleTracked = TRUE;
        const parent = parentNode(element);
        element.isAttachedToDOM = parent ? 
            onLifecycle_CheckIfParentsAttachedToDOM(parent, element) : FALSE;

        // TODO: consider if below is reasonable
        // // autorun event if element is attached to DOM while adding event
        // autorun && element.isAttachedToDOM && eventListener(element, TRUE);
        element.isAttachedToDOM && eventListener(LIFECYCLE_ATTACHED, element);
    }
    if (optionalElement) event(optionalElement);
    return event;
}
onLifecycle.remove = (element, eventListener) => {
    if (element.onLifecycle) {
        element.onLifecycle.del(eventListener);
        onLifecycle_UpdateElementAndParentsDueToRemoval(element);
    }
}
const onLifecycleRaise = (element, status) => {
    switch (status) {
        case LIFECYCLE_DETACHED:
            element.isAttachedToDOM = FALSE;
            break;
        case LIFECYCLE_ATTACHED:
            element.isAttachedToDOM = TRUE;
            // attach will bubble down
            if (element.onLifecycle) element.onLifecycle.raise(status);
            break;
    }

    if (element.onLifecycleListeningChildren) {
        element.onLifecycleListeningChildren.forEach(e => onLifecycleRaise(e, status));
    }

    if (!element.isAttachedToDOM) {
        // detach will bubble up
        if (element.onLifecycle) element.onLifecycle.raise(status);
    }
}


// ################################################
// Styles section
// ################################################

const CSSContentMap = {};
const updateCSSContent = runIfInactive(() => {
    let content = '';
    for (let name in CSSContentMap) {
        const element = CSSContentMap[name];
        if (element) content +=  CSSContentMap[name].__CSS__;
    }
    docStyle.innerHTML = content;
}, 0);

// ================================================
const STYLE_TYPE_EVENT = 1;
const STYLE_TYPE_OPTION = 2;
const STYLE_TYPE_BRANCH = 3;

// ================================================

let styleFontSize = 16;
export const styleSetFontSize = (size) => {
    styleFontSize = size;
}

export const em = (size) => size ? ((size * styleFontSize) | 0) + 'px' : 0;
const styleOnPostCompilation = (callback, ...args) => (value, styleObject) => {
    styleObject.__runAfterCompile__.push(
        () => callback(value, styleObject, ...args)
    )
    return styleObject.__compiled__;
}
const stylePrefixedPropertyGroup = (prefix, exclusions={}, importance=[], directUseCallback) => {
    const styleImportance = makeEnumFromStringArray(importance);

    return (valuesObject, styleObject) => {
        if (isObject(valuesObject) && !isArray(valuesObject)) {
            let words = []

            const addPropName = name => 
                words.push([name, styleImportance[name] || 11111]);
    
            const processSingle = (name, value) => {
                if (isObject(value) && !isArray(value)) {
                    addPropName(name);
                    process(value);
                    words.pop();
                } else {
                    addPropName(name);
                    const propNameFinal = prefix + words
                        .sort(([keyA, valueA], [keyB, valueB]) => valueA-valueB)
                        .map(([key]) => makeFirstCapital(key))
                        .join('');
    
                    styleObject.__compiled__[propNameFinal] = value;
                    words.pop();
                }
            }
    
            const process = obj => {
                for (let name in obj) {
                    processSingle(name, obj[name]);
                }
            }
    
            for (let nameSuffix in valuesObject) {
                const exclusion = exclusions[nameSuffix];
                const value = valuesObject[nameSuffix];
                if (exclusion) {
                    if (isFunction(exclusion)) {
                        styleObject.__compiled__ = exclusion(value, styleObject);
                    } else {
                        styleObject.__compiled__[exclusion] = value;
                    }
                } else if (nameSuffix === '$') {
                    styleObject.__compiled__[prefix] = value;
                } else {
                    processSingle(nameSuffix, value);
                }
            }    
        } else {
            if (directUseCallback) {
                styleObject.__compiled__ = directUseCallback(valuesObject, styleObject)
            } else {
                styleObject.__compiled__[prefix] = valuesObject;
            }
        }

        return styleObject.__compiled__;
    }
}
const propertyNameToStylePropertyName = propertyName => {
    let result = '';
    for (let i = 0; i < propertyName.length; i++) {
        const char = propertyName[i];
        const charNonCapital = char.toLowerCase();
        if (char === charNonCapital) {
            result += char;
        } else if (char === '_') {
            result += '-';
        } else {
            result += '-' + charNonCapital;
        }
    }
    return result;
}
const subStyleProperty = (value, styleObject, type) => {
    for (let name in value) {
        // const subStyleDefinition = Object.assign({}, styleObject.__compiled__, value[name]);
        // const subStyleDefinition = Object.assign({}, value[name]);
        const subStyleDefinition = value[name];

        if (styleObject[name] === UNDEFINED) {
            const newStyleObject = style(subStyleDefinition);
            newStyleObject.__parentId__ = styleObject.__id__;
            newStyleObject.__type__ = type;
            newStyleObject.__typeName__ = name;
            styleObject[name] = newStyleObject;
        } else { 
            // TODO: throw error
        }
    }
    return styleObject.__compiled__;
}
// ------------------------------------------------
const styleCustomSelector   = styleOnPostCompilation((value, styleObject) => {
    styleObject.__selector__ = value;
    return styleObject.__compiled__;
});
const styleCustomInherit    = (value, styleObject) => {
    value = makeArray(value);
    return Object.assign(
        {},
        ...value.map(s => s.__compiled__), 
        styleObject.__compiled__
    );
}

const styleCustomText       = stylePrefixedPropertyGroup('text', {
    font: 'fontFamily',
    size: 'fontSize',
    style: 'fontStyle',
    weight: 'fontWeight',
    height: 'lineHeight',
    color: 'color',
});
const styleCustomBackground = stylePrefixedPropertyGroup('background');
const styleCustomBorder     = stylePrefixedPropertyGroup('border', {}, 
    ['block', 'inline', 'parts', ['start', 'end'], 'top', 'bottom', 'left', 'right']);
const styleCustomMargin     = stylePrefixedPropertyGroup('margin');
const styleCustomPadding    = stylePrefixedPropertyGroup('padding');

const styleCustomOptions    = styleOnPostCompilation(subStyleProperty, STYLE_TYPE_OPTION);
const styleCustomOn         = styleOnPostCompilation(subStyleProperty, STYLE_TYPE_EVENT);
const styleCustomBranches   = styleOnPostCompilation(subStyleProperty, STYLE_TYPE_BRANCH);

const styleCustomProperties = {
    inherit:    styleCustomInherit,
    selector:   styleCustomSelector,

    text:       styleCustomText,
    background: styleCustomBackground,
    border:     styleCustomBorder,
    margin:     styleCustomMargin,
    padding:    styleCustomPadding,

    options:    styleCustomOptions,
    on:         styleCustomOn,
    branches:   styleCustomBranches,
}
// ------------------------------------------------
const getCSSBody = styleObject => {
    if (styleObject.__CSSBody__) return styleObject.__CSSBody__;
    const __compiled__ = styleObject.__compiled__;
    const result = ['{'];
    for (let name in __compiled__) {
        const propertyName = propertyNameToStylePropertyName(name);
        let propertyValue = __compiled__[name];
        if (isNumber(propertyValue)) {
            propertyValue = em(propertyValue);
        } else if (isArray(propertyValue)) {
            propertyValue = propertyValue.map(e => {
                if (isNumber(e)) e = em(e);
                return e;
            }).join(' ');
        }

        result.push(propertyName + ':' + propertyValue + ';');

    }
    result.push('}');
    return styleObject.__CSSBody__ = result.join('');
}
const getSelectorNamed = styleObject => {
    if (!styleObject.__CSS__) {
        const selectorList = ['.' + styleObject.__name__];
        if (styleObject.__selector__) selectorList.push(styleObject.__selector__);
        if (styleObject.__type__ === STYLE_TYPE_EVENT) {
            selectorList.push(
                prepareSelectorNamed(styleObject.__parentId__) + ':' +
                propertyNameToStylePropertyName(styleObject.__typeName__)
            )
        }        

        for (let name in styleObject) {
            const element = styleObject[name];
            if (element) {
                if (element.__type__ === STYLE_TYPE_EVENT) {
                    getSelectorNamed(element);
                // } else if (element.__type__) {
                //     CSSContentMap[styleObject.__name__] = null; // preserve order
                }
            }
        }

        styleObject.__CSS__ = selectorList.join(',') + 
            getCSSBody(styleObject);

        CSSContentMap[styleObject.__name__] = styleObject;
        updateCSSContent();
    }
    return styleObject.__name__;
}
// ------------------------------------------------
let styleId = 0;
const styleNamePrefix = '_S';
const prepareName = id => styleNamePrefix + id;
const prepareSelectorNamed = id => '.' + prepareName(id);

export const style = (...inheritsAndDefinitions) => {
    let argPos = inheritsAndDefinitions.length;
    let inherits = {};
    let __definition__ = {};

    while (argPos) {
        argPos--;
        const element = inheritsAndDefinitions[argPos];

        if (element.__compiled__) {
            Object.assign(inherits, element.__compiled__);
        } else {
            Object.assign(__definition__, element);
        }
    }


    styleId++;
    const __compiled__ = Object.assign({}, inherits, __definition__);
    // console.log(__compiled__)
    const __runAfterCompile__ = [];
    const styleObject = {
        __op__:                 OP_STYLE,
        __id__:                 styleId,
        __name__:               prepareName(styleId),
        __selectorNamed__:      prepareSelectorNamed(styleId),
        __definition__,
        __compiled__,
        __runAfterCompile__
    }

    for (let customProperty in styleCustomProperties) {
        const value = __compiled__[customProperty]; 
        if (value !== undefined) {
            delete __compiled__[customProperty];
            styleObject.__compiled__ = styleCustomProperties[customProperty](value, styleObject);
        }
    }
    for (let i = 0; i < __runAfterCompile__.length; i++) {
        __runAfterCompile__[i]();
    }
    delete styleObject.__runAfterCompile__;
    if (styleObject.__selector__) getSelectorNamed(styleObject); // if custom selector defined then compile style immediately

    return styleObject;
}
export const addClass = (element, className) => element.classList.add(className);
export const removeClass = (element, className) => element.classList.remove(className);

const selectedOptionPrefix = '__so';

export const styleSet = (element, styleObject) => {
    const selectorNamed = getSelectorNamed(styleObject);
    if (styleObject.__type__ === STYLE_TYPE_OPTION) {
        const prefix = selectedOptionPrefix + styleObject.__parentId__;
        const currentStyleName = element[prefix];
        if (currentStyleName) {
            if (currentStyleName !== selectorNamed) {
                removeClass(element, currentStyleName);
                addClass(element, element[prefix] = selectorNamed);    
            }
        } else {
            addClass(element, element[prefix] = selectorNamed);
        }
    } else {
        addClass(element, selectorNamed);
    }

}
export const styleDel = (element, styleObject) => {
    const selectorNamed = getSelectorNamed(styleObject);
    if (styleObject.__type__ === STYLE_TYPE_OPTION) {
        const prefix = selectedOptionPrefix + styleObject.__parentId__;
        const currentStyleName = element[prefix];
        if (currentStyleName) {
            removeClass(element, currentStyleName);
            delete element[prefix];
        }
    } else {
        removeClass(element, selectorNamed);
    }
}

// ################################################
// HTML element sextion
// ################################################
const OP_STYLE = 1;
const OP_EVENT = 2;
let   OP_FREE  = 3;


export const createElement = element => doc.createElement(element);

const elementCustomOperations = {
    [OP_STYLE]: styleSet,
    [OP_EVENT]: eventAdd
}
const createElementCore = (tagName, ce = createElement) => (...children) => {
    const element = ce(tagName);

    /* less flexible, faster version here: */

    // let i = 0;
    // for (; i < children.length; i++) {
    //     const child = children[i];
    //     let op;
    //     if (child) {
    //         if (isFunction(child)) {
    //             child(element);
    //         } else if (op = child.__op__) {
    //             elementCustomOperations[op](element, child);
    //         } else break;    
    //     }
    // }

    // for (; i < children.length; i++) {
    //     const child = children[i];
    //     child && appendChildOnBottom(element, child);
    // }

    // ==== v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v^v ====

    /* more flexible, slower version here: */
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        let op;
        if (child) {
            if (isFunction(child)) {
                child(element);
            } else if (op = child.__op__) {
                elementCustomOperations[op](element, child);
            } else if (isString(child)) {
                appendChildOnBottom(element, text(child))
            } else {
                appendChildOnBottom(element, child);
            }
        }
    }

    return element; 
}
export const separateElementArgs = args => {
    const operations = [];
    const other = [];
    const result = {
        operations, other
    }

    for (let i=0; i < args.length; i++) {
        const child = args[i];
        if (child.__op__) {
            operations.push(child);
        } else {
            other.push(child);
        }
    }

    return result;
}

export const comment    = (data = '') => doc.createComment(data);
export const text       = (txt) => doc.createTextNode(txt);
export const body       = /*@__PURE__*/createElementCore('', () => bodyNative);
export const div        = /*@__PURE__*/createElementCore('div');
export const span       = /*@__PURE__*/createElementCore('span');
export const a          = /*@__PURE__*/createElementCore('a');
export const img        = /*@__PURE__*/createElementCore('img');

export const input      = /*@__PURE__*/createElementCore('input');
export const textarea   = /*@__PURE__*/createElementCore('textarea');
export const select     = /*@__PURE__*/createElementCore('select');
export const option     = (...args) => new Option(...args);



// ================================================

export const forEachChild = (element, callback) => {
    const children = element.children;
    const childrenLength = children.length
    for (let i = 0; i < childrenLength; i++) {
        if (callback(children[i], i)) return;
    }
}
export const forEachParent = (element, callback, includeElement) => {
    let result;
    if (!includeElement) element = parentNode(element);

    while (element) {
        if ((result = callback(element)) !== UNDEFINED) return result;
        if (element === bodyNative) return;
        element = parentNode(element);
    }
}

// ------------------------------------------------

export const replaceChild_raw = (element, childNew, childOld) => element.replaceChild(childNew, childOld);
export const appendChildOnBottom_raw = (element, child) => element.appendChild(child);
export const appendChildBefore_raw = (element, child, before) => element.insertBefore(child, before);
export const appendChildAfter_raw = (element, child, after) => {
    const next = nextNode(after);
    if (next) {
        appendChildBefore(element, child, next);
    } else {
        appendChildOnBottom(element, child);
    }
}
export const appendChildOnTop_raw = (element, child) => appendChildBefore(element, child, firstNode(element));
export const removeChild_raw = (element, child) => element.removeChild(child);
export const removeElement_raw = (element) => removeChild(parentNode(element), element);

// ------------------------------------------------

const postAppendLifecycleProcess = (element, child, previosParentOfChild) => {
    if (previosParentOfChild && (previosParentOfChild !== element)) {
        previosParentOfChild.onLifecycleListeningChildren.delete(child);
        onLifecycle_UpdateElementAndParentsDueToRemoval(element);
    }


    // if (element.onLifecycleListeningChildren) {
    //     // element.isLifecycleTracked = TRUE;
    //     element.onLifecycleListeningChildren.set(child, child);
    // } else if (!element.isLifecycleTracked || !element.onLifecycleListeningChildren) {
        onLifecycle_CheckIfParentsAttachedToDOM(element, child);
    // }

    if (element.isAttachedToDOM) {
        if (!child.isAttachedToDOM) {
            onLifecycleRaise(child, LIFECYCLE_ATTACHED);
        }
    } else {
        if (child.isAttachedToDOM) {
            onLifecycleRaise(child, LIFECYCLE_DETACHED);
        }
    }
}
const postRemoveLifecycleProcess = (element, child) => {
    onLifecycleRaise(child, LIFECYCLE_DETACHED);
    const onLifecycleListeningChildren = element.onLifecycleListeningChildren;
    if (onLifecycleListeningChildren) {
        onLifecycleListeningChildren.delete(child);
        onLifecycle_UpdateElementAndParentsDueToRemoval(element);
    }
}
export const replaceChild = (element, childNew, childOld) => {
    if (childNew !== childOld) {
        const previosParentOfChildNew = parentNode(childNew);
        replaceChild_raw(element, childNew, childOld);
        if (childOld.isLifecycleTracked) {
            postRemoveLifecycleProcess(element, childOld);
        }
        if (childNew.isLifecycleTracked) {
            postAppendLifecycleProcess(element, childNew, previosParentOfChildNew);
        }  
    }
}
export const appendChildOnBottom = (element, child) => {

    if (child.isLifecycleTracked) {
        const previosParentOfChild = parentNode(child);
        appendChildOnBottom_raw(element, child);
        postAppendLifecycleProcess(element, child, previosParentOfChild);
    } else {
        appendChildOnBottom_raw(element, child);
    }
}
export const appendChildBefore = (element, child, before) => {

    if (child.isLifecycleTracked) {
        const previosParentOfChild = parentNode(child);
        appendChildBefore_raw(element, child, before);
        postAppendLifecycleProcess(element, child, previosParentOfChild);
    } else {
        appendChildBefore_raw(element, child, before);
    }
}
export const appendChildAfter = (element, child, after) => {
    if (child.isLifecycleTracked) {
        const previosParentOfChild = parentNode(child);
        appendChildAfter_raw(element, child, after);
        postAppendLifecycleProcess(element, child, previosParentOfChild);
    } else {
        appendChildAfter_raw(element, child, after);
    }
}
export const appendChildOnTop = (element, child) => {
    if (child.isLifecycleTracked) {
        const previosParentOfChild = parentNode(child);
        appendChildOnTop_raw(element, child);
        postAppendLifecycleProcess(element, child, previosParentOfChild);
    } else {
        appendChildOnTop_raw(element, child);
    }
}
export const removeChild = (element, child) => {
    removeChild_raw(element, child);
    if (child.isLifecycleTracked) {
        postRemoveLifecycleProcess(element, child);
    }  
}
export const removeElement = (element) => {
    const parentOfElement = parentNode(element);
    if (parentOfElement) {
        removeChild_raw(parentOfElement, element);
        if (element.isLifecycleTracked) {
            postRemoveLifecycleProcess(parentOfElement, element);
        }  
    }
}
