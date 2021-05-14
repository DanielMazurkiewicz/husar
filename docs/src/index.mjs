import '../../styleReset/main.mjs'

import {attributes}     from './db/attributes.mjs';
import {aliases}        from './db/aliases.mjs';

import { body } from '../../core.mjs';
import { docDb } from './components/docDb.mjs';

import { filter } from './components/filter.mjs';




body(
    filter(),
    docDb(attributes),
    docDb(aliases)
);