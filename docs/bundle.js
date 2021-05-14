(() => {
  // debouncer.mjs
  "use strict";
  var DEBOUNCER_CANCEL = 0;
  var DEBOUNCER_INSTANT = 1;
  var DEBOUNCER_RUSH = 3;
  var runIfInactive = (callback, timeInMs = 30) => {
    const activator = (sureToActivate) => {
      const isAwaiting = activator.isAwaiting;
      if (isAwaiting) {
        clearTimeout(isAwaiting - 1);
        activator.isAwaiting = 0;
      }
      if (sureToActivate === DEBOUNCER_INSTANT || isAwaiting && sureToActivate === DEBOUNCER_RUSH) {
        return callback();
      }
      if (sureToActivate === DEBOUNCER_CANCEL) {
        return;
      }
      activator.isAwaiting = setTimeout(() => {
        activator.isAwaiting = 0;
        callback();
      }, timeInMs) + 1;
    };
    return activator;
  };

  // core.mjs
  var TRUE = 1;
  var FALSE = 0;
  var toBoolean = (value) => value ? TRUE : FALSE;
  var UNDEFINED = void 0;
  var wnd = window;
  var doc = document;
  var docStyle = doc.getElementsByTagName("style")[0];
  var bodyNative = doc.body;
  bodyNative.isAttachedToDOM = TRUE;
  bodyNative.isLifecycleTracked = TRUE;
  bodyNative.onLifecycleListeningChildren = new Map();
  var isArray2 = (tested) => Array.isArray(tested);
  var isFunction = (v) => typeof v === "function";
  var isObject = (o) => typeof o === "object" && o !== null;
  var isString = (value) => typeof value === "string";
  var isNumber = (value) => Number.isFinite(value);
  var makeArray = (element) => isArray2(element) ? element : [element];
  var makeFirstCapital = (text2) => text2[0].toUpperCase() + text2.substr(1);
  var makeEnumFromStringArray = (arr) => {
    const result = {};
    arr.forEach((e, i) => {
      if (isArray2(e)) {
        e.forEach((el) => result[el] = i + 1);
      } else {
        result[e] = i + 1;
      }
    });
    return result;
  };
  var makeCharList = (...list2) => {
    list2 = list2.map((l) => {
      if (isString(l)) {
        const newList = {};
        for (let i = 0; i < l.length; i++) {
          newList[l[i]] = 1;
        }
        return newList;
      }
      return l;
    });
    const result = Object.assign({}, ...list2);
    return result;
  };
  var parentNode = (element) => element.parentNode;
  var setAttribute = (element, attribute, value) => element.setAttribute(attribute, value);
  var SoftEvent = (...fixedArgs) => {
    const list2 = new Map();
    list2.add = (callback) => (list2.set(callback, callback), callback);
    list2.del = list2.delete;
    list2.raise = (...param) => list2.forEach((callback) => callback(...param, ...fixedArgs));
    return list2;
  };
  var addEvent_raw = (element, eventName, eventListener) => element.addEventListener(eventName, eventListener);
  var removeEvent_raw = (element, eventName, eventListener) => element.removeEventListener(eventName, eventListener);
  var eventAdd = (element, eventObject) => {
    addEvent_raw(element, eventObject.__name__, eventObject.__listener__);
  };
  var createEvent = (eventName) => {
    const event = (eventListener, optionalElement) => {
      if (optionalElement) {
        addEvent_raw(optionalElement, eventName, eventListener);
      } else {
        return {
          __op__: OP_EVENT,
          __name__: eventName,
          __listener__: eventListener
        };
      }
    };
    event.remove = (element, eventListener) => removeEvent_raw(element, eventName, eventListener);
    return event;
  };
  var onChange = /* @__PURE__ */ createEvent(`change`);
  var LIFECYCLE_DETACHED = 0;
  var LIFECYCLE_ATTACHED = 1;
  var onLifecycle_CheckIfParentsAttachedToDOM = (element, child) => {
    const isAttachedToDOM = forEachParent(element, (e) => {
      if (e.isLifecycleTracked)
        return e.isAttachedToDOM;
    }, TRUE);
    forEachParent(element, (e) => {
      e.isAttachedToDOM = isAttachedToDOM;
      if (e.onLifecycleListeningChildren === UNDEFINED)
        e.onLifecycleListeningChildren = new Map();
      e.onLifecycleListeningChildren.set(child, child);
      if (e.isLifecycleTracked)
        return e;
      e.isLifecycleTracked = TRUE;
      child = e;
    }, TRUE);
    return isAttachedToDOM;
  };
  var onLifecycle_UpdateElementAndParentsDueToRemoval = (element) => {
    if ((!element.onLifecycle || !element.onLifecycle.size) && (!element.onLifecycleListeningChildren || !element.onLifecycleListeningChildren.size)) {
      element.isLifecycleTracked = FALSE;
      let child = element;
      forEachParent(element, (e) => {
        if (e.onLifecycleListeningChildren) {
          e.onLifecycleListeningChildren.delete(child);
        }
        if (e === bodyNative)
          return TRUE;
        if ((!e.onLifecycle || !e.onLifecycle.size) && (!e.onLifecycleListeningChildren || !e.onLifecycleListeningChildren.size)) {
          e.isLifecycleTracked = FALSE;
        } else {
          return TRUE;
        }
        child = e;
      });
    }
  };
  var onLifecycle = (eventListener, optionalElement) => {
    const event = (element) => {
      if (!element.onLifecycle)
        element.onLifecycle = SoftEvent(element);
      element.onLifecycle.add(eventListener);
      element.isLifecycleTracked = TRUE;
      const parent = parentNode(element);
      element.isAttachedToDOM = parent ? onLifecycle_CheckIfParentsAttachedToDOM(parent, element) : FALSE;
      element.isAttachedToDOM && eventListener(LIFECYCLE_ATTACHED, element);
    };
    if (optionalElement)
      event(optionalElement);
    return event;
  };
  onLifecycle.remove = (element, eventListener) => {
    if (element.onLifecycle) {
      element.onLifecycle.del(eventListener);
      onLifecycle_UpdateElementAndParentsDueToRemoval(element);
    }
  };
  var onLifecycleRaise = (element, status) => {
    switch (status) {
      case LIFECYCLE_DETACHED:
        element.isAttachedToDOM = FALSE;
        break;
      case LIFECYCLE_ATTACHED:
        element.isAttachedToDOM = TRUE;
        if (element.onLifecycle)
          element.onLifecycle.raise(status);
        break;
    }
    if (element.onLifecycleListeningChildren) {
      element.onLifecycleListeningChildren.forEach((e) => onLifecycleRaise(e, status));
    }
    if (!element.isAttachedToDOM) {
      if (element.onLifecycle)
        element.onLifecycle.raise(status);
    }
  };
  var CSSContentMap = {};
  var updateCSSContent = runIfInactive(() => {
    let content = "";
    for (let name in CSSContentMap) {
      const element = CSSContentMap[name];
      if (element)
        content += CSSContentMap[name].__CSS__;
    }
    docStyle.innerHTML = content;
  }, 0);
  var STYLE_TYPE_EVENT = 1;
  var STYLE_TYPE_OPTION = 2;
  var STYLE_TYPE_BRANCH = 3;
  var styleFontSize = 16;
  var em = (size) => size ? (size * styleFontSize | 0) + "px" : 0;
  var styleOnPostCompilation = (callback, ...args) => (value, styleObject) => {
    styleObject.__runAfterCompile__.push(() => callback(value, styleObject, ...args));
    return styleObject.__compiled__;
  };
  var stylePrefixedPropertyGroup = (prefix, exclusions = {}, importance = [], directUseCallback) => {
    const styleImportance = makeEnumFromStringArray(importance);
    return (valuesObject, styleObject) => {
      if (isObject(valuesObject) && !isArray2(valuesObject)) {
        let words = [];
        const addPropName = (name) => words.push([name, styleImportance[name] || 11111]);
        const processSingle = (name, value) => {
          if (isObject(value) && !isArray2(value)) {
            addPropName(name);
            process(value);
            words.pop();
          } else {
            addPropName(name);
            const propNameFinal = prefix + words.sort(([keyA, valueA], [keyB, valueB]) => valueA - valueB).map(([key]) => makeFirstCapital(key)).join("");
            styleObject.__compiled__[propNameFinal] = value;
            words.pop();
          }
        };
        const process = (obj) => {
          for (let name in obj) {
            processSingle(name, obj[name]);
          }
        };
        for (let nameSuffix in valuesObject) {
          const exclusion = exclusions[nameSuffix];
          const value = valuesObject[nameSuffix];
          if (exclusion) {
            if (isFunction(exclusion)) {
              styleObject.__compiled__ = exclusion(value, styleObject);
            } else {
              styleObject.__compiled__[exclusion] = value;
            }
          } else if (nameSuffix === "$") {
            styleObject.__compiled__[prefix] = value;
          } else {
            processSingle(nameSuffix, value);
          }
        }
      } else {
        if (directUseCallback) {
          styleObject.__compiled__ = directUseCallback(valuesObject, styleObject);
        } else {
          styleObject.__compiled__[prefix] = valuesObject;
        }
      }
      return styleObject.__compiled__;
    };
  };
  var propertyNameToStylePropertyName = (propertyName) => {
    let result = "";
    for (let i = 0; i < propertyName.length; i++) {
      const char = propertyName[i];
      const charNonCapital = char.toLowerCase();
      if (char === charNonCapital) {
        result += char;
      } else if (char === "_") {
        result += "-";
      } else {
        result += "-" + charNonCapital;
      }
    }
    return result;
  };
  var subStyleProperty = (value, styleObject, type) => {
    for (let name in value) {
      const subStyleDefinition = value[name];
      if (styleObject[name] === UNDEFINED) {
        const newStyleObject = style(subStyleDefinition);
        newStyleObject.__parentId__ = styleObject.__id__;
        newStyleObject.__type__ = type;
        newStyleObject.__typeName__ = name;
        styleObject[name] = newStyleObject;
      } else {
      }
    }
    return styleObject.__compiled__;
  };
  var styleCustomSelector = styleOnPostCompilation((value, styleObject) => {
    styleObject.__selector__ = value;
    return styleObject.__compiled__;
  });
  var styleCustomInherit = (value, styleObject) => {
    value = makeArray(value);
    return Object.assign({}, ...value.map((s) => s.__compiled__), styleObject.__compiled__);
  };
  var styleCustomText = stylePrefixedPropertyGroup("text", {
    font: "fontFamily",
    size: "fontSize",
    style: "fontStyle",
    weight: "fontWeight",
    height: "lineHeight",
    color: "color"
  });
  var styleCustomBackground = stylePrefixedPropertyGroup("background");
  var styleCustomBorder = stylePrefixedPropertyGroup("border", {}, ["block", "inline", "parts", ["start", "end"], "top", "bottom", "left", "right"]);
  var styleCustomMargin = stylePrefixedPropertyGroup("margin");
  var styleCustomPadding = stylePrefixedPropertyGroup("padding");
  var styleCustomOptions = styleOnPostCompilation(subStyleProperty, STYLE_TYPE_OPTION);
  var styleCustomOn = styleOnPostCompilation(subStyleProperty, STYLE_TYPE_EVENT);
  var styleCustomBranches = styleOnPostCompilation(subStyleProperty, STYLE_TYPE_BRANCH);
  var styleCustomProperties = {
    inherit: styleCustomInherit,
    selector: styleCustomSelector,
    text: styleCustomText,
    background: styleCustomBackground,
    border: styleCustomBorder,
    margin: styleCustomMargin,
    padding: styleCustomPadding,
    options: styleCustomOptions,
    on: styleCustomOn,
    branches: styleCustomBranches
  };
  var getCSSBody = (styleObject) => {
    if (styleObject.__CSSBody__)
      return styleObject.__CSSBody__;
    const __compiled__ = styleObject.__compiled__;
    const result = ["{"];
    for (let name in __compiled__) {
      const propertyName = propertyNameToStylePropertyName(name);
      let propertyValue = __compiled__[name];
      if (isNumber(propertyValue)) {
        propertyValue = em(propertyValue);
      } else if (isArray2(propertyValue)) {
        propertyValue = propertyValue.map((e) => {
          if (isNumber(e))
            e = em(e);
          return e;
        }).join(" ");
      }
      result.push(propertyName + ":" + propertyValue + ";");
    }
    result.push("}");
    return styleObject.__CSSBody__ = result.join("");
  };
  var getSelectorNamed = (styleObject) => {
    if (!styleObject.__CSS__) {
      const selectorList = ["." + styleObject.__name__];
      if (styleObject.__selector__)
        selectorList.push(styleObject.__selector__);
      if (styleObject.__type__ === STYLE_TYPE_EVENT) {
        selectorList.push(prepareSelectorNamed(styleObject.__parentId__) + ":" + propertyNameToStylePropertyName(styleObject.__typeName__));
      }
      for (let name in styleObject) {
        const element = styleObject[name];
        if (element) {
          if (element.__type__ === STYLE_TYPE_EVENT) {
            getSelectorNamed(element);
          }
        }
      }
      styleObject.__CSS__ = selectorList.join(",") + getCSSBody(styleObject);
      CSSContentMap[styleObject.__name__] = styleObject;
      updateCSSContent();
    }
    return styleObject.__name__;
  };
  var styleId = 0;
  var styleNamePrefix = "_S";
  var prepareName = (id) => styleNamePrefix + id;
  var prepareSelectorNamed = (id) => "." + prepareName(id);
  var style = (...inheritsAndDefinitions) => {
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
    const __runAfterCompile__ = [];
    const styleObject = {
      __op__: OP_STYLE,
      __id__: styleId,
      __name__: prepareName(styleId),
      __selectorNamed__: prepareSelectorNamed(styleId),
      __definition__,
      __compiled__,
      __runAfterCompile__
    };
    for (let customProperty in styleCustomProperties) {
      const value = __compiled__[customProperty];
      if (value !== void 0) {
        delete __compiled__[customProperty];
        styleObject.__compiled__ = styleCustomProperties[customProperty](value, styleObject);
      }
    }
    for (let i = 0; i < __runAfterCompile__.length; i++) {
      __runAfterCompile__[i]();
    }
    delete styleObject.__runAfterCompile__;
    if (styleObject.__selector__)
      getSelectorNamed(styleObject);
    return styleObject;
  };
  var addClass = (element, className) => element.classList.add(className);
  var removeClass = (element, className) => element.classList.remove(className);
  var selectedOptionPrefix = "__so";
  var styleSet = (element, styleObject) => {
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
  };
  var OP_STYLE = 1;
  var OP_EVENT = 2;
  var createElement = (element) => doc.createElement(element);
  var elementCustomOperations = {
    [OP_STYLE]: styleSet,
    [OP_EVENT]: eventAdd
  };
  var createElementCore = (tagName, ce = createElement) => (...children) => {
    const element = ce(tagName);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      let op;
      if (child) {
        if (isFunction(child)) {
          child(element);
        } else if (op = child.__op__) {
          elementCustomOperations[op](element, child);
        } else if (isString(child)) {
          appendChildOnBottom(element, text(child));
        } else {
          appendChildOnBottom(element, child);
        }
      }
    }
    return element;
  };
  var separateElementArgs = (args) => {
    const operations = [];
    const other = [];
    const result = {
      operations,
      other
    };
    for (let i = 0; i < args.length; i++) {
      const child = args[i];
      if (child.__op__) {
        operations.push(child);
      } else {
        other.push(child);
      }
    }
    return result;
  };
  var comment = (data = "") => doc.createComment(data);
  var text = (txt) => doc.createTextNode(txt);
  var body = /* @__PURE__ */ createElementCore("", () => bodyNative);
  var div = /* @__PURE__ */ createElementCore("div");
  var span = /* @__PURE__ */ createElementCore("span");
  var input = /* @__PURE__ */ createElementCore("input");
  var forEachParent = (element, callback, includeElement) => {
    let result;
    if (!includeElement)
      element = parentNode(element);
    while (element) {
      if ((result = callback(element)) !== UNDEFINED)
        return result;
      if (element === bodyNative)
        return;
      element = parentNode(element);
    }
  };
  var replaceChild_raw = (element, childNew, childOld) => element.replaceChild(childNew, childOld);
  var appendChildOnBottom_raw = (element, child) => element.appendChild(child);
  var postAppendLifecycleProcess = (element, child, previosParentOfChild) => {
    if (previosParentOfChild && previosParentOfChild !== element) {
      previosParentOfChild.onLifecycleListeningChildren.delete(child);
      onLifecycle_UpdateElementAndParentsDueToRemoval(element);
    }
    onLifecycle_CheckIfParentsAttachedToDOM(element, child);
    if (element.isAttachedToDOM) {
      if (!child.isAttachedToDOM) {
        onLifecycleRaise(child, LIFECYCLE_ATTACHED);
      }
    } else {
      if (child.isAttachedToDOM) {
        onLifecycleRaise(child, LIFECYCLE_DETACHED);
      }
    }
  };
  var postRemoveLifecycleProcess = (element, child) => {
    onLifecycleRaise(child, LIFECYCLE_DETACHED);
    const onLifecycleListeningChildren = element.onLifecycleListeningChildren;
    if (onLifecycleListeningChildren) {
      onLifecycleListeningChildren.delete(child);
      onLifecycle_UpdateElementAndParentsDueToRemoval(element);
    }
  };
  var replaceChild = (element, childNew, childOld) => {
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
  };
  var appendChildOnBottom = (element, child) => {
    if (child.isLifecycleTracked) {
      const previosParentOfChild = parentNode(child);
      appendChildOnBottom_raw(element, child);
      postAppendLifecycleProcess(element, child, previosParentOfChild);
    } else {
      appendChildOnBottom_raw(element, child);
    }
  };

  // styleReset/main.mjs
  var styleMainHtml = style({
    selector: "html",
    fontSize: 1,
    whiteSpace: "pre-wrap",
    lineHeight: `1.15`,
    _webkitTextSizeAdjust: `100%`
  });
  var styleMainBody = style({
    selector: "body",
    height: `100vh`
  });
  var styleMainAll = style({
    selector: "*",
    boxSizing: "border-box",
    margin: 0,
    padding: 0,
    font: "inherit",
    overflow: "auto",
    userSelect: "none"
  });

  // string.mjs
  "use strict";
  var emptyChar = makeCharList(" 	");
  var newLineChar = makeCharList("\n\r");
  var emptyOrNewLineChar = makeCharList(emptyChar, newLineChar);
  var stringUnfold = (text2) => {
    let result = [], previousChar = "";
    let spaceStart = -1;
    let skipSpacesMode = 0;
    for (let i = 0; i < text2.length; i++) {
      const char = text2[i];
      if (spaceStart < 0 && emptyOrNewLineChar[char] && !emptyOrNewLineChar[previousChar]) {
        spaceStart = i;
      }
      if (newLineChar[char]) {
        skipSpacesMode = 1;
        if (spaceStart < 0)
          spaceStart = i;
      }
      if (!emptyOrNewLineChar[char] && emptyOrNewLineChar[previousChar]) {
        if (skipSpacesMode) {
          result.length && result.push(" ");
          skipSpacesMode = 0;
        } else {
          result.length && result.push(text2.substring(spaceStart, i));
        }
        spaceStart = -1;
      }
      if (!emptyOrNewLineChar[char])
        result.push(char);
      previousChar = char;
    }
    return result.join("");
  };

  // object.mjs
  "use strict";
  var objectAssign = (...elements) => Object.assign(...elements);
  var objectDelete = (object, ...elements) => {
    const toDelete = objectAssign({}, ...elements);
    object = objectAssign({}, object);
    for (let name in toDelete) {
      delete object[name];
    }
    return object;
  };
  var objectAssignIfDoesntExist = (object, ...elements) => {
    elements.forEach((e) => {
      for (let name in e) {
        if (object[name] === UNDEFINED)
          object[name] = e[name];
      }
    });
    return object;
  };

  // docs/src/utils/normalize.mjs
  var unfoldDescriptionFromString = (description2) => {
    if (isString(description2)) {
      description2 = {
        type: "text",
        text: description2
      };
    }
    return description2;
  };
  var unfoldDescription = (description2) => {
    description2 = makeArray(description2);
    description2 = description2.map(unfoldDescriptionFromString);
    description2.forEach((d) => {
      if (d.text)
        d.text = stringUnfold(d.text);
    });
    return description2;
  };
  var toDeleteForSharedProperties = {
    list: 1,
    description: 1,
    title: 1
  };
  var normalizeDocObject = (element) => {
    const sharedProperties = objectDelete(element, toDeleteForSharedProperties);
    if (element.description)
      element.description = unfoldDescription(element.description);
    if (element.list) {
      element.list.forEach((e) => {
        if (e.description)
          e.description = unfoldDescription(e.description);
        objectAssignIfDoesntExist(e, sharedProperties);
        if (e.params) {
          e.params = makeArray(e.params);
          e.params = e.params.map((p) => isString(p) ? {name: p} : p);
          e.params.forEach((p) => {
            if (p.description)
              p.description = unfoldDescription(p.description);
          });
        }
        if (e.usage) {
          e.usage = makeArray(e.usage);
          e.usage = e.usage.map((u) => isString(u) ? {example: u} : u);
          e.usage.forEach((u) => {
            if (u.description)
              u.description = unfoldDescription(u.description);
          });
        }
        if (e.returns && e.returns.description)
          e.returns.description = unfoldDescription(e.returns.description);
      });
    }
    return element;
  };

  // docs/src/db/attributes.mjs
  var attributes = normalizeDocObject({
    title: "Attributes",
    module: `core.mjs`,
    type: `attribute`,
    description: `Setting attributes should be done via specified in this framework methods.`,
    list: [
      {
        name: `placeholder`,
        kind: "method",
        params: [
          {
            name: "text",
            type: "string"
          },
          {
            name: "element",
            type: "HTMLElement",
            optional: 1
          }
        ],
        description: `Sets a 'placeholder" attribute`,
        usage: [
          `const inputDateField = input(placeholder('yyyy-mm-dd'));`,
          `const inputDateField = input(); placeholder('yyyy-mm-dd', inputDateField);`
        ]
      },
      {
        name: `href`,
        kind: "method",
        params: [
          {
            name: "text",
            type: "string"
          },
          {
            name: "element",
            type: "HTMLElement",
            optional: 1
          }
        ],
        description: `Sets a 'href" attribute`,
        usage: [
          `const link = a(href('https://some-thing.com'));`,
          `const link = a(); href('https://some-thing.com', link);`
        ]
      },
      {
        name: `src`,
        kind: "method",
        params: [
          {
            name: "text",
            type: "string"
          },
          {
            name: "element",
            type: "HTMLElement",
            optional: 1
          }
        ],
        description: `Sets a 'src" attribute`,
        usage: [
          `const image = img(src('https://some-thing.com/picture.jpg'));`,
          `const image = img(); src('https://some-thing.com/picture.jpg', image);`
        ]
      }
    ]
  });

  // docs/src/db/aliases.mjs
  var aliases = normalizeDocObject({
    title: `Aliases`,
    module: `core.mjs`,
    type: `alias`,
    description: `Aliases are convenience literals that are shorter to type and/or produce 
        smaller code after minification.`,
    list: [
      {
        name: `wnd`,
        raw: 1,
        kind: "singleton",
        description: `Alias to "window" object`,
        usage: `const widthInPixels = wnd.innerWidth;`
      },
      {
        name: `doc`,
        raw: 1,
        kind: "singleton",
        description: `Alias to "document" object`,
        usage: `const  = doc.getElementsByTagName('div');`
      },
      {
        name: `docStyle`,
        raw: 1,
        kind: "singleton",
        description: `Alias to first "style" element in HTML document`,
        usage: `docStyle.innerHTML += '*{color:red}'`
      },
      {
        name: `bodyNative`,
        raw: 1,
        kind: "singleton",
        description: `Alias to "document.body" element`,
        usage: `docBody.appendChildren('test');'`
      },
      {
        name: `parentNode`,
        raw: 1,
        kind: "method",
        params: [
          {
            name: "element",
            type: "HTMLElement"
          }
        ],
        returns: {
          type: `HTMLElement`,
          description: `Parent element to given node element (or null if no parent element)`
        },
        description: `Alias to 'parentNode' property of given 'element'`,
        usage: `const parent = parentNode(element);`
      },
      {
        name: `firstNode`,
        raw: 1,
        kind: "method",
        params: [
          {
            name: "element",
            type: "HTMLElement"
          }
        ],
        returns: {
          type: `HTMLElement`,
          description: `First child of element (or 'null' if no children)`
        },
        description: `Alias to 'firstChild' property of given 'element'`,
        usage: `const first = firstNode(element);`
      },
      {
        name: `previousNode`,
        raw: 1,
        kind: "method",
        params: [
          {
            name: "element",
            type: "HTMLElement"
          }
        ],
        returns: {
          type: `HTMLElement`,
          description: `Previous sibling element to given node element (or 'null' if no 
            previous element)`
        },
        description: `Alias to 'previousSibling' property of given 'element'`,
        usage: `const previous = previousNode(element);`
      },
      {
        name: `nextNode`,
        raw: 1,
        kind: "method",
        params: [
          {
            name: "element",
            type: "HTMLElement"
          }
        ],
        returns: {
          type: `HTMLElement`,
          description: `Next sibling element to given node element (or 'null' if no next element)`
        },
        description: `Alias to 'nextSibling' property of given 'element'`,
        usage: `const next = nextNode(element);`
      },
      {
        name: `setAttribute`,
        raw: 1,
        kind: "method",
        params: [
          {
            name: "element",
            type: "HTMLElement"
          },
          {
            name: "attribute",
            type: "string"
          },
          {
            name: "value",
            type: "string"
          }
        ],
        description: `Sets to given HTMLElement attribute a value. Alias to 'setAttribute' method 
        of given 'element'`,
        usage: `setAttribute(inputElement, 'type', 'text');`
      },
      {
        name: `getAttribute`,
        raw: 1,
        kind: "method",
        params: [
          {
            name: "element",
            type: "HTMLElement"
          },
          {
            name: "attribute",
            type: "string"
          }
        ],
        returns: {
          type: `string | null`,
          description: `Value of attribute`
        },
        description: `Gets a value from given HTMLElement attribute. Alias to 'getAttribute' method of given 'element'`,
        usage: `const inputElementType = getAttribute(inputElement, 'type');`
      },
      {
        name: `removeAttribute`,
        raw: 1,
        kind: "method",
        params: [
          {
            name: "element",
            type: "HTMLElement"
          },
          {
            name: "attribute",
            type: "string"
          }
        ],
        description: `Removes attribute from given HTMLElement. Alias to 'removeAttribute' method of given 'element'`,
        usage: `removeAttribute(inputElement, 'type');`
      }
    ]
  });

  // docs/src/components/description.mjs
  var description = (d) => {
    if (!d || !d.length)
      return;
    const root = div(...d.map((d2) => {
      switch (d2.type) {
        case "text":
          return div(d2.text);
        default:
          return div("!!!UNDEFINED BEHAVIOUR!!! " + JSON.stringify(d2));
      }
    }));
    return root;
  };

  // styles.mjs
  var directionRow = /* @__PURE__ */ style({
    display: "flex",
    flexDirection: "row"
  });

  // docs/src/components/bulletpoint.mjs
  var bulletpoint = (...elements) => {
    const args = separateElementArgs(elements);
    const root = div(directionRow, ...args.operations, span("\u2192 "), span(...args.other));
    return root;
  };

  // array.mjs
  "use strict";
  var arrayForEachRev = (array, callback) => {
    let i = array.length - 1;
    while (i >= 0) {
      callback(array[i], i);
      i--;
    }
  };

  // base93.mjs
  var numberToBase93 = (number) => {
    number = number % 93;
    number += 32;
    if (number >= 34)
      number++;
    if (number >= 92)
      number++;
    return String.fromCharCode(number);
  };

  // random.mjs
  var crypto = wnd.crypto;
  var getRandomString = (numOf, characters = true) => {
    const elements = Math.ceil(numOf / (characters ? 1 : 6.539));
    const randoms = new Uint16Array(elements);
    crypto.getRandomValues(randoms);
    let result = "";
    for (let i = 0; i < elements; i++) {
      result += numberToBase93(randoms[i]);
    }
    return result;
  };

  // store.mjs
  var StoreObjectBase = (type) => {
    const delTemporary = () => {
      if (obj.parent) {
        obj.parentContent.onElementDel(obj);
        if (!obj.previous)
          obj.parentContent.first = obj.next;
        if (!obj.next)
          obj.parentContent.last = obj.previous;
        obj.previous.next = obj.next;
        obj.next.previous = obj.previous;
        obj.parent = obj.parentContent = obj.previous = obj.next = null;
      }
    };
    const obj = {
      id: getRandomString(10),
      type,
      parent: null,
      parentContent: null,
      previous: null,
      next: null,
      delTemporary,
      addBefore: (element) => {
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
      addAfter: (element) => {
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
    };
    return obj;
  };
  var StoreValue = (objectToExtend, name, type = "content-value") => {
    const obj = objectToExtend[name] = {
      type,
      owner: objectToExtend,
      name,
      value: null,
      s: (v) => {
        const old = obj.value;
        if (old !== v) {
          obj.value = v;
          obj.onChange.raise(v, old, objectToExtend);
        }
      },
      g: () => obj.value
    };
    obj.onChange = SoftEvent(objectToExtend, obj);
    return obj;
  };
  var $Boolean = StoreValue;
  var internalKindId = -1;
  var StoreKind = (...description2) => {
    let name;
    if (!name)
      name = internalKindId--;
    const descriptionResolved = {};
    arrayForEachRev(description2, (d) => {
      if (d.constructorDescription) {
        Object.assign(descriptionResolved, d.constructorDescription);
      } else if (isObject(d)) {
        Object.assign(descriptionResolved, d);
      } else {
        name = d;
      }
    });
    if (!name)
      name = internalKindId--;
    const constructor = () => {
      const obj = StoreObjectBase(name);
      for (let name2 in descriptionResolved) {
        descriptionResolved[name2](obj, name2);
      }
      return obj;
    };
    constructor.constructorName = name;
    constructor.constructorDescription = descriptionResolved;
    return constructor;
  };
  var $kind = StoreKind;
  var StoreViewIf = (value, htmlFunctionForTrue, htmlFunctionForFalse, inversed) => (parentHTML) => {
    const dummyComment = htmlFunctionForFalse || comment();
    let oldChildHTML, newChildHTML;
    const getChildHTML = inversed ? htmlFunctionForFalse ? (v) => newChildHTML = v ? htmlFunctionForFalse(value.owner) : htmlFunctionForTrue(value.owner) : (v) => newChildHTML = v ? dummyComment : htmlFunctionForTrue(value.owner) : htmlFunctionForFalse ? (v) => newChildHTML = v ? htmlFunctionForTrue(value.owner) : htmlFunctionForFalse(value.owner) : (v) => newChildHTML = v ? htmlFunctionForTrue(value.owner) : dummyComment;
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
  };
  var StoreSyncValue = (value, htmlValuePresenter) => {
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
  };
  var $if = StoreViewIf;
  var $sync = StoreSyncValue;

  // inputTypes.mjs
  var typeCheckbox = (element) => {
    setAttribute(element, "type", "checkbox");
    element.onValueChange = SoftEvent(element);
    let internalValue = FALSE;
    const setElementValue = () => {
      if (internalValue === UNDEFINED) {
        element.checked = FALSE;
        element.indeterminate = TRUE;
      } else {
        element.checked = internalValue;
        element.indeterminate = FALSE;
      }
    };
    element.s = (v) => {
      const internalValuePrevious = internalValue;
      internalValue = v === UNDEFINED ? UNDEFINED : toBoolean(v);
      if (internalValue !== internalValuePrevious) {
        setElementValue();
        element.onValueChange.raise(internalValue, internalValuePrevious, element);
      }
    };
    element.g = () => internalValue;
    const toggle = () => {
      if (!element.readOnly) {
        if (internalValue === UNDEFINED) {
          internalValue = TRUE;
        } else if (internalValue === TRUE) {
          internalValue = FALSE;
        } else if (element.isTristate) {
          internalValue = UNDEFINED;
        } else {
          internalValue = TRUE;
        }
        setElementValue();
      }
    };
    onChange(() => {
      const internalValuePrevious = internalValue;
      toggle();
      element.onValueChange.raise(internalValue, internalValuePrevious, element);
    }, element);
  };

  // docs/src/components/filter.mjs
  var FilterData = $kind({
    showDetails: $Boolean,
    showParameters: $Boolean,
    showCode: $Boolean
  });
  var filterData = FilterData();
  var filter = () => {
    const root = div("Show details: ", $sync(filterData.showDetails, input(typeCheckbox)), $if(filterData.showDetails, () => span("   Show parameters description: ", $sync(filterData.showParameters, input(typeCheckbox)), "   Show code examples: ", $sync(filterData.showCode, input(typeCheckbox)))));
    return root;
  };

  // fonts.mjs
  var mono_free = `FreeMono,monospace`;

  // docs/src/components/code.mjs
  var codeStyle = style({
    border: {
      style: "solid",
      width: 0.1,
      color: "lightgrey",
      radius: 0.2
    },
    padding: 0.2
  });
  var codeStyleCode = style({
    background: {
      color: "lightgrey"
    },
    padding: 0.2,
    text: {
      font: mono_free,
      size: 0.8
    }
  });
  var code = (c) => {
    const root = div(codeStyle, description(c.description), div(codeStyleCode, c.example));
    return root;
  };

  // docs/src/components/namedSection.mjs
  var sectionHeaderStyle = style({
    text: {
      color: "#00001a",
      size: 0.8,
      weight: "bold"
    }
  });
  var namedSection = (sectionName, ...elements) => {
    const args = separateElementArgs(elements);
    const root = div(...args.operations, div(sectionHeaderStyle, sectionName), ...args.other);
    return root;
  };

  // docs/src/components/importStatement.mjs
  var importStatement = (i) => {
    const root = namedSection("Import statement:", code({
      example: `import { ${i.name} } from 'hussar/${i.module}';`
    }));
    return root;
  };

  // docs/src/components/parameters.mjs
  var parametersShort = (params) => {
    if (!params)
      return text("()");
    const root = span("(", params.map((p) => p.name).join(", "), ")");
    return root;
  };
  var parametersStyle = style({
    border: {
      left: {
        style: "solid",
        width: 0.2,
        color: "lightblue"
      }
    },
    padding: {
      left: 0.2
    },
    margin: {
      left: 0.2
    }
  });
  var parameters = (params) => {
    if (!params || !params.length)
      return;
    const root = namedSection("Parameters:", div(parametersStyle, ...params.map((p) => div(p.name, ": ", p.type))));
    return root;
  };

  // docs/src/components/returns.mjs
  var returns = (r) => {
    if (!r)
      return;
    const root = namedSection("Returns:", div(directionRow, span(r.type, r.description && ": "), description(r.description)));
    return root;
  };

  // docs/src/components/usageList.mjs
  var usageList = (l) => {
    if (!l || !l.length)
      return;
    const root = namedSection("Usage:", ...l.map((u) => code(u)));
    return root;
  };

  // docs/src/components/method.mjs
  var methodStyleName = style({
    text: {
      weight: "bold",
      color: "darkblue"
    }
  });
  var method = (m) => {
    const root = div(div(span(methodStyleName, m.name), parametersShort(m.params)), $if(filterData.showDetails, () => div(description(m.description), $if(filterData.showParameters, () => parameters(m.params)), returns(m.returns), $if(filterData.showCode, () => div(importStatement(m), usageList(m.usage))))));
    return root;
  };

  // docs/src/components/singleton.mjs
  var singletonStyleName = style({
    text: {
      weight: "bold",
      color: "darkgreen"
    }
  });
  var singleton = (s) => {
    const root = div(div(singletonStyleName, s.name), $if(filterData.showDetails, () => div(description(s.description), $if(filterData.showCode, () => div(importStatement(s), usageList(s.usage))))));
    return root;
  };

  // docs/src/components/list.mjs
  var listStyle = style({
    margin: {
      left: 0.5
    }
  });
  var list = (l) => {
    if (!l)
      return;
    const root = div(listStyle, ...l.map((e) => {
      switch (e.kind) {
        case "method":
          return method(e);
        case "singleton":
          return singleton(e);
      }
    }).map((e) => bulletpoint(e)));
    return root;
  };

  // docs/src/components/docDb.mjs
  var docDbStyleTitle = style({
    text: {
      size: 1.5
    }
  });
  var docDb = (db) => {
    const root = div(div(docDbStyleTitle, db.title), description(db.description), list(db.list));
    return root;
  };

  // docs/src/index.mjs
  body(filter(), docDb(attributes), docDb(aliases));
})();
//# sourceMappingURL=bundle.js.map
