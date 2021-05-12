import { arrayForEach, arrayForEachRev }    from "./array.mjs";
import { getRandomString }                  from "./random.mjs";

import { isFunction }                       from "./core.mjs";
import { isObject }                         from "./core.mjs";

import { SoftEventSelective }               from "./core.mjs";
import { SoftEvent }                        from "./core.mjs";

import { TRUE }                             from "./core.mjs";
import { UNDEFINED }                        from "./core.mjs";
import { LIFECYCLE_ATTACHED }               from "./core.mjs";
import { LIFECYCLE_DETACHED }               from "./core.mjs";
import { onLifecycle }                      from "./core.mjs";

import { comment }                          from "./core.mjs";
import { replaceChild }                     from "./core.mjs";
import { removeChild }                      from "./core.mjs";
import { appendChildBefore }                from "./core.mjs";
import { appendChildOnBottom }              from "./core.mjs";


export const StoreObjectBase = (type) => {
    const delTemporary = () => {
        if (obj.parent) {
            obj.parentContent.onElementDel(obj);

            if (!obj.previous)  obj.parentContent.first    = obj.next;
            if (!obj.next)      obj.parentContent.last     = obj.previous;

            obj.previous.next = obj.next;
            obj.next.previous = obj.previous;

            obj.parent = obj.parentContent = obj.previous = obj.next = null;
        }
    }

    const obj = {
        id:             getRandomString(10),
        type,

        parent:         null,
        parentContent:  null,

        previous:       null,
        next:           null,

        delTemporary,

        addBefore:      (element) => {
            element.delTemporary();

            if (obj.previous) {
                obj.previous.next = element;
                element.previous = obj.previous;
            }
            obj.previous = element;
            element.next = obj;
            element.parent = obj.parent;
            element.parentContent = obj.parentContent;

            element.parentContent.onElementAdd.raise(element);
        },
        addAfter:       (element) => {
            element.delTemporary();

            if (obj.next) {
                obj.next.previous = element;
                element.next = obj.next;
            }
            obj.next = element;
            element.next = obj;
            element.parent = obj.parent;
            element.parentContent = obj.parentContent;

            element.parentContent.onElementAdd.raise(element);
        }

    }
    // return store[obj.id] = obj;
    return obj;
}

//==================================================================

export const StoreList = (objectToExtend, name, type='content-list') => {

    const addOnTop =   (element) => {
        element.delTemporary();

        if (obj.first) {
            element.next = obj.first;
            obj.first.previous = element;
            obj.first = element;
        } else {
            obj.first = obj.last = element;
        }
        element.parent = objectToExtend;
        element.parentContent = obj;

        obj.onElementAdd.raise(element);
    }

    const addOnBottom = (element) => {
        element.delTemporary();

        if (obj.last) {
            element.previous = obj.last;
            obj.last.next = element;
            obj.last = element;
        } else {
            obj.first = obj.last = element;
        }
        element.parent = objectToExtend;
        element.parentContent = obj;

        obj.onElementAdd.raise(element);
    }

    const obj = objectToExtend[name] = {
        type,
        owner:          objectToExtend,
        name,

        first:          null,
        last:           null,

        addOnTop:       (...elements) => (arrayForEachRev(elements, addOnTop), objectToExtend),
        addOnBottom:    (...elements) => (arrayForEach(elements, addOnBottom), objectToExtend),
        forEach:        (callback) => {
            let el = obj.first;
            while (el) {
                callback(el, obj);
                el = el.next;
            }
        },
        forEachRev:     (callback) => {
            let el = obj.last;
            while (el) {
                callback(el, obj);
                el = el.previous;
            }
        },
    }
    obj.onElementAdd = SoftEvent(objectToExtend, obj);
    obj.onElementDel = SoftEvent(objectToExtend, obj);
    
    return obj;
}
export const StoreListIndexed = (objectToExtend, name) => {
    const obj = StoreList(objectToExtend, name, 'content-list-indexed');
    const index = new Map();
    obj.onElementAdd.add(e => index.set(e, e));
    obj.onElementDel.add(e => index.delete(e));
    obj.contain = (e) => index.has(e) && e;
    return obj;
}
export const StoreValue = (objectToExtend, name, type='content-value') => {
    const obj = objectToExtend[name] = {
        type,
        owner:          objectToExtend,
        name,

        value:          null,
        s:              (v) => {
            const old = obj.value;
            if (old !== v) {
                obj.value = v;
                obj.onChange.raise(v, old, objectToExtend);
            }
        },
        g:              () => obj.value
    }
    obj.onChange = SoftEvent(objectToExtend, obj);
    
    return obj;
}
export const StoreReference = (objectToExtend, name) => {
    const obj = StoreValue(objectToExtend, name, 'content-reference');
    obj.onChange.add((newRef, oldRef) => {
        obj.onReferenceDel.raise(oldRef);
        obj.onReferenceAdd.raise(newRef);
    });
    obj.contain = ref => obj.g() === ref;
    obj.onReferenceChange = obj.onChange;
    obj.onReferenceAdd = SoftEventSelective(objectToExtend, obj);
    obj.onReferenceDel = SoftEventSelective(objectToExtend, obj);
    return obj;
}
export const StoreReferencesList = (objectToExtend, name) => {
    const map = new Map();

    const obj = objectToExtend[name] = {
        type:           'content-references-list',
        owner:          objectToExtend,
        name,

        add:            (ref) => {
            if (!map.has(ref)) {
                map.set(ref, ref);
                obj.onReferenceAdd.raise(ref);
            }
        },
        del:            (ref) => {
            if (map.has(ref)) {
                map.delete(ref);
                obj.onReferenceDel.raise(ref);
            }
        },

        contain:        (ref) => map.has(ref),
        forEach:        (callback) => map.forEach(callback)
    }

    obj.onReferenceAdd = SoftEventSelective(objectToExtend, obj);
    obj.onReferenceDel = SoftEventSelective(objectToExtend, obj);


    return obj;
}

//==================================================================

let internalKindId = -1;
export const StoreKind = (...description) => {
    let name;
    if (!name) name = internalKindId--;
    const descriptionResolved = {};
    arrayForEachRev(description, d => {
        if (d.constructorDescription) {
            Object.assign(descriptionResolved, d.constructorDescription);
        } else if (isObject(d)) {
            Object.assign(descriptionResolved, d);
        } else {
            name = d;
        }
    });

    if (!name) name = internalKindId--;

    const constructor = () => {
        const obj = StoreObjectBase(name);
        for (let name in descriptionResolved) {
            descriptionResolved[name](obj, name);
        }
        return obj;
    }
    constructor.constructorName = name;
    constructor.constructorDescription = descriptionResolved;
    return constructor;
}
export const StoreHTMLRouter = (fallback, constructors = {}) => {
    const router = {
        fallback,
        constructors,
        add: (kind, HTMLConstructor) => (constructors[kind.constructorName] = HTMLConstructor, router),
        setFallback: fallbackCallback => (router.fallback = fallbackCallback, router),
    };

    return router;
}

//==================================================================

const emptyConstructors = {};
export const StoreViewList = (list, htmlRouter) => (parentHTML) => {
    
    let constructors, fallback;
    // -----------------------------------------
    if (isFunction(htmlRouter)) {
        constructors = emptyConstructors;
        fallback = htmlRouter;
    } else {
        constructors = htmlRouter.constructors;
        fallback = htmlRouter.fallback;    
    }
    fallback = fallback || ( () => comment() );
    // -----------------------------------------

    const elementAddEvent = el => {
        const constructor = constructors[el.type] || fallback;
        if (constructor) {
            const childHTML = constructor(el);
            if (childHTML) {
                childrenList.set(el, childHTML);
                if (el.next) {
                    let beforeEl, beforeHTML;
                    while (1) {
                        beforeEl = el.next;
                        if (beforeEl) {
                            beforeHTML = childrenList.get(beforeEl);
                            if (beforeHTML) {
                                appendChildBefore(parentHTML, childHTML, beforeHTML);
                                break;
                            }
                        } else {
                            appendChildOnBottom(parentHTML, childHTML);
                            break;
                        }
                    }
                } else {
                    appendChildOnBottom(parentHTML, childHTML);
                }
            }
        }
    };

    const elementDelEvent = el => {
        const childHTML = childrenList.get(el);
        if (childHTML) {
            childrenList.delete(el);
            removeChild(parentHTML, childHTML);
        }
    };


    let childrenList = new Map();

    onLifecycle((status) => {
        switch (status) {
            case LIFECYCLE_ATTACHED:
                let newChildrenList = new Map();
                let el = list.first;
                while (el) {
                    const childHTMLFromList = childrenList.get(el);
                    if (childHTMLFromList) {
                        appendChildOnBottom(parentHTML, childHTMLFromList);
                        newChildrenList.set(el, childHTMLFromList);
                    } else {
                        const constructor = constructors[el.type] || fallback;
                        if (constructor) {
                            const childHTML = constructor(el);
                            if (childHTML) {
                                newChildrenList.set(el, childHTML);
                                appendChildOnBottom(parentHTML, childHTML);
                            }
                        }
                    }

                    el = el.next;
                }
                childrenList = newChildrenList;

                list.onElementAdd.add(elementAddEvent);
                list.onElementDel.add(elementDelEvent);
                break;

            case LIFECYCLE_DETACHED:
                list.onElementAdd.del(elementAddEvent);
                list.onElementDel.del(elementDelEvent);
                break;
        }
    }, parentHTML);
}
export const StoreViewReference = (ref, htmlRouter) => (parentHTML) => {
    
    let constructors, fallback;
    // -----------------------------------------
    if (isFunction(htmlRouter)) {
        constructors = emptyConstructors;
        fallback = htmlRouter;
    } else {
        constructors = htmlRouter.constructors;
        fallback = htmlRouter.fallback;
    }
    fallback = fallback || ( () => comment() );
    // -----------------------------------------



    const getChildHTML = (el) => {
        const constructor = (el && constructors[el.type]) || fallback;

        let childHTML = constructor(el);
        if (!childHTML) {
            childHTML = fallback(el);
        }
        return childHTML;
    }

    let childHTML;
    const childReplacer = (el) => {
        const newChildHTML = getChildHTML(el);
        replaceChild(parentHTML, newChildHTML, childHTML);
        childHTML = newChildHTML;
    }

    let el = ref.g();
    onLifecycle((status) => {
        switch (status) {
            case LIFECYCLE_ATTACHED:
                ref.onChange.add(childReplacer);

                if (childHTML) {
                    const oldEl = el;
                    el = ref.g();
                    if (el !== oldEl) {
                        childReplacer(el);
                    }
                }
                break;

            case LIFECYCLE_DETACHED:
                el = ref.g();
                ref.onChange.del(childReplacer);
                break;
        }
    }, parentHTML);

    childHTML = getChildHTML(el);
    appendChildOnBottom(parentHTML, childHTML);
}
export const StoreViewIf = (value, htmlFunctionForTrue, htmlFunctionForFalse, inversed) => (parentHTML) => {
    const dummyComment = htmlFunctionForFalse || comment();

    let oldChildHTML, newChildHTML;
    const getChildHTML = inversed ? (
        htmlFunctionForFalse ? (
            (v) => newChildHTML = v ? htmlFunctionForFalse(value.owner) : htmlFunctionForTrue(value.owner)
        ) : (
            (v) => newChildHTML = v ? dummyComment : htmlFunctionForTrue(value.owner)
        )
    ) : (
        htmlFunctionForFalse ? (
            (v) => newChildHTML = v ? htmlFunctionForTrue(value.owner) : htmlFunctionForFalse(value.owner)
        ) : (
            (v) => newChildHTML = v ? htmlFunctionForTrue(value.owner) : dummyComment
        )
    );

    const childReplacer = (v) => {
        replaceChild(parentHTML, getChildHTML(v), oldChildHTML);
        oldChildHTML = newChildHTML;
    };

    onLifecycle((status) => {
        switch (status) {
            case LIFECYCLE_ATTACHED:
                if (oldChildHTML) {
                    childReplacer(value.g());
                } else {
                    appendChildOnBottom(parentHTML, oldChildHTML = getChildHTML(value.g()));
                }
                value.onChange.add(childReplacer);
                break;

            case LIFECYCLE_DETACHED:
                value.onChange.del(childReplacer);
                break;
        }
    }, parentHTML);
}
export const StoreViewValue = (value, htmlValuePresenter) => {
    onLifecycle((status) => {
        switch (status) {
            case LIFECYCLE_ATTACHED:
                htmlValuePresenter.s(value.g());
                value.onChange.add(htmlValuePresenter.s);
                htmlValuePresenter.onValueChange && htmlValuePresenter.onValueChange.add(value.s);
                break;

            case LIFECYCLE_DETACHED:
                htmlValuePresenter.onValueChange && htmlValuePresenter.onValueChange.del(value.s);
                value.onChange.del(htmlValuePresenter.s);
                break;
        }
    }, htmlValuePresenter);

    return htmlValuePresenter;
}