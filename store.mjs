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
import { getTimestamp } from "./dateTime.mjs";


export const StoreObjectBase = (kindId) => {
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
        // id:             getRandomString(10),
        kindId,

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
/*
export const $NowFixed_KindId           = '$NowFixed';
export const $UidFixed_KindId           = '$UidFixed';
export const $Reference_KindId          = '$Reference';
export const $Boolean_KindId            = '$Boolean';
export const $Unsigned_KindId           = '$Unsigned';
export const $Signed_KindId             = '$Signed';
export const $Float_KindId              = '$Float';
export const $Date_KindId               = '$Date';
export const $Text_KindId               = '$Text';
export const $Email_KindId              = '$Email';
export const $Color_KindId              = '$Color';
export const $Url_KindId                = '$Url';
export const $Uid_KindId                = '$Uid';
export const $Data_KindId               = '$Data';

export const $List_KindId               = '$List';
export const $ListIndexed_KindId        = '$ListIndexed';
export const $ListOfReferences_KindId   = '$ListOfReferences';
*/

export const $NowFixed_KindId           = -1;
export const $UidFixed_KindId           = -2;
export const $Reference_KindId          = -3;
export const $Boolean_KindId            = -4;
export const $Unsigned_KindId           = -5;
export const $Signed_KindId             = -6;
export const $Float_KindId              = -7;
export const $Date_KindId               = -8;
export const $Text_KindId               = -9;
export const $Email_KindId              = -10;
export const $Color_KindId              = -11;
export const $Url_KindId                = -12;
export const $Uid_KindId                = -13;
export const $Data_KindId               = -14;

export const $List_KindId               = -15;
export const $ListIndexed_KindId        = -16;
export const $ListOfReferences_KindId   = -17;

const NEXT_INTERNAL_KIND_ID = $ListOfReferences_KindId - 1;

//==================================================================

export const StoreNewListType = kindId => (objectToExtend, name) => {

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
        kindId,
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
const StoreList_ListIndexed = /*@__PURE__*/StoreNewListType($ListIndexed_KindId);
export const StoreListIndexed = (objectToExtend, name) => {
    const obj = StoreList_ListIndexed(objectToExtend, name);
    const index = new Map();
    obj.onElementAdd.add(e => index.set(e, e));
    obj.onElementDel.add(e => index.delete(e));
    obj.contain = (e) => index.has(e) && e;
    return obj;
}
export const StoreNewValueType = (kindId) => (objectToExtend, name) => {
    const obj = objectToExtend[name] = {
        kindId,
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
const StoreValue_Reference = /*@__PURE__*/StoreNewValueType($Reference_KindId);
export const StoreReference = (objectToExtend, name) => {
    const obj = StoreValue_Reference(objectToExtend, name);
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
        kindId:           $ListOfReferences_KindId,
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

// -----------------------------------------------------------

export const $NowFixed          = (objectToExtend, name) => {
    objectToExtend[name] = {
        kindId: NowFixed_KindId,
        value: getTimestamp()
    }
};
export const $UidFixed          = (objectToExtend, name) => {
    objectToExtend[name] = {
        kindId: UidFixed_KindId,
        value: getRandomString(10)
    }
};
export const $Reference         = StoreReference;
export const $Boolean           = /*@__PURE__*/StoreNewValueType($Boolean_KindId);
export const $Unsigned          = /*@__PURE__*/StoreNewValueType($Unsigned_KindId);
export const $Signed            = /*@__PURE__*/StoreNewValueType($Unsigned_KindId);
export const $Float             = /*@__PURE__*/StoreNewValueType($Signed_KindId);
export const $Date              = /*@__PURE__*/StoreNewValueType($Date_KindId);
export const $Text              = /*@__PURE__*/StoreNewValueType($Text_KindId);
export const $Email             = /*@__PURE__*/StoreNewValueType($Email_KindId);
export const $Color             = /*@__PURE__*/StoreNewValueType($Color_KindId);
export const $Url               = /*@__PURE__*/StoreNewValueType($Url_KindId);
export const $Uid               = /*@__PURE__*/StoreNewValueType($Uid_KindId);
// export const $Data              = StoreNewValueType($Data_KindId);

export const $List              = /*@__PURE__*/StoreNewListType($List_KindId);
export const $ListIndexed       = StoreListIndexed;
export const $ListOfReferences  = StoreReferencesList;


//==================================================================

let internalKindId = NEXT_INTERNAL_KIND_ID;
export const StoreKind = (...description) => {
    let name;

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

export const $kind = StoreKind;
export const $router = StoreHTMLRouter;

//==================================================================

const emptyConstructors = {};
export const StoreSyncList = (list, htmlRouter) => (parentHTML) => {
    
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
        const constructor = constructors[el.kindId] || fallback;
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
                        const constructor = constructors[el.kindId] || fallback;
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
export const StoreSyncReference = (ref, htmlRouter) => (parentHTML) => {
    
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
        const constructor = (el && constructors[el.kindId]) || fallback;

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

    appendChildOnBottom(parentHTML, oldChildHTML = comment());

    onLifecycle((status) => {
        switch (status) {
            case LIFECYCLE_ATTACHED:
                childReplacer(value.g());
                value.onChange.add(childReplacer);
                break;

            case LIFECYCLE_DETACHED:
                value.onChange.del(childReplacer);
                break;
        }
    }, parentHTML);
}
export const StoreSyncValue = (value, htmlValuePresenter) => {
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

export const $if                = StoreViewIf;
export const $sync              = StoreSyncValue;
export const $syncList          = StoreSyncList;
export const $syncReference     = StoreSyncReference;


// TODO: $or $not $and $less $above $lessEqual $aboveEqual
// TODO: $sum $sub $mul $div $neg