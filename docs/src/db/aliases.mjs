export const aliases = {
    module:         `core.mjs`,
    type:           `alias`,
    description: 
`
Aliases are convenience literals that are shorter to type and/or produce smaller code after minification
`,
list: [

// --------------------------------------
{   name:           `wnd`,
    raw:            1,
    kind:           'singleton',
    description:    `Alias to "window" object`,
    usage:          `const widthInPixels = wnd.innerWidth;`
},
{   name:           `doc`,
    raw:            1,
    kind:           'singleton',
    description:    `Alias to "document" object`,
    usage:          `const  = doc.getElementsByTagName('div');`
},
{   name:           `docStyle`,
    raw:            1,
    kind:           'singleton',
    description:    `Alias to first "style" element in HTML document`,
    usage:          `docStyle.innerHTML += '*{color:red}'`
},
{   name:           `bodyNative`,
    raw:            1,
    kind:           'singleton',
    description:    `Alias to "document.body" element`,
    usage:          `docBody.appendChildren('test');'`
},
// --------------------------------------
{   name:           `parentNode`,
    raw:            1,
    kind:           'method',
    params: [
        {
            name: 'element',
            type: 'HTMLElement'
        }
    ],
    returns: {
        type:       `HTMLElement`,
        description:`Parent element to given node element (or null if no parent element)`
    },
    description:    `Alias to 'parentNode' property of given 'element'`,
    usage:          `const parent = parentNode(element);`
},
{   name:           `firstNode`,
    raw:            1,
    kind:           'method',
    params: [
        {
            name: 'element',
            type: 'HTMLElement'
        }
    ],
    returns: {
        type:       `HTMLElement`,
        description:`First child of element (or 'null' if no children)`
    },
    description:    `Alias to 'firstChild' property of given 'element'`,
    usage:          `const first = firstNode(element);`
},
{   name:           `previousNode`,
    raw:            1,
    kind:           'method',
    params: [
        {
            name: 'element',
            type: 'HTMLElement'
        }
    ],
    returns: {
        type:       `HTMLElement`,
        description:`Previous sibling element to given node element (or 'null' if no previous element)`
    },
    description:    `Alias to 'previousSibling' property of given 'element'`,
    usage:          `const previous = previousNode(element);`
},
{   name:           `nextNode`,
    raw:            1,
    kind:           'method',
    params: [
        {
            name: 'element',
            type: 'HTMLElement'
        }
    ],
    returns: {
        type:       `HTMLElement`,
        description:`Next sibling element to given node element (or 'null' if no next element)`
    },
    description:    `Alias to 'nextSibling' property of given 'element'`,
    usage:          `const next = nextNode(element);`
},
// --------------------------------------
{   name:           `setAttribute`,
    raw:            1,
    kind:           'method',
    params: [
        {
            name: 'element',
            type: 'HTMLElement'
        },
        {
            name: 'attribute',
            type: 'string'
        },
        {
            name: 'value',
            type: 'string'
        },
    ],
    description:    `Sets HTMLElement attribute value. Alias to 'setAttribute' method of given 'element'`,
    usage:          `setAttribute(inputElement, 'type', 'text');`
},
{   name:           `getAttribute`,
    raw:            1,
    kind:           'method',
    params: [
        {
            name: 'element',
            type: 'HTMLElement'
        },
        {
            name: 'attribute',
            type: 'string'
        },

    ],
    returns: {
        type:       `string | null`,
        description:`Value of attribute`
    },
    description:    `Gets HTMLElement attribute value. Alias to 'getAttribute' method of given 'element'`,
    usage:          `const inputElementType = getAttribute(inputElement, 'type');`
},
{   name:           `removeAttribute`,
    raw:            1,
    kind:           'method',
    params: [
        {
            name: 'element',
            type: 'HTMLElement'
        },
        {
            name: 'attribute',
            type: 'string'
        },

    ],
    description:    `Removes attribute from given HTMLElement. Alias to 'removeAttribute' method of given 'element'`,
    usage:          `removeAttribute(inputElement, 'type');`
},

]
};
