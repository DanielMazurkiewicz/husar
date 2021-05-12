export const attributes = {
    module:         `core.mjs`,
    type:           `attribute`,
    description: `Setting attributes should be done via specified framework methods"`,
list: [

// --------------------------------------
{   name:           `placeholder`,
    kind:           'method',
    params: [
        {
            name: 'text',
            type: 'string',
        },
        {
            name: 'element',
            type: 'HTMLElement',
            optional: 1
        }
    ],
    description:    `sets a 'placeholder" attribute`,
    usage: [
        `const inputDateField = input(placeholder('yyyy-mm-dd'));`,
        `const inputDateField = input(); placeholder('yyyy-mm-dd', inputDateField);`
    ]
},
{   name:           `href`,
    kind:           'method',
    params: [
        {
            name: 'text',
            type: 'string',
        },
        {
            name: 'element',
            type: 'HTMLElement',
            optional: 1
        }
    ],
    description:    `sets a 'href" attribute`,
    usage: [
        `const link = a(href('https://some-thing.com'));`,
        `const link = a(); href('https://some-thing.com', link);`
    ]
},

{   name:           `src`,
    kind:           'method',
    params: [
        {
            name: 'text',
            type: 'string',
        },
        {
            name: 'element',
            type: 'HTMLElement',
            optional: 1
        }
    ],
    description:    `sets a 'src" attribute`,
    usage: [
        `const image = img(src('https://some-thing.com/picture.jpg'));`,
        `const image = img(); src('https://some-thing.com/picture.jpg', image);`
    ]
},


]
};
