import { $kind } from '../../../store.mjs';
import { $sync } from '../../../store.mjs';
import { $Boolean } from '../../../store.mjs';

import { input } from '../../../core.mjs';
import { div } from '../../../core.mjs';

import { typeCheckbox } from '../../../inputTypes.mjs';
import { $if } from '../../../store.mjs';
import { span } from '../../../core.mjs';


/*
    New data kind declaration
*/
const FilterData = $kind({
    showDetails:    $Boolean,
    showParameters: $Boolean,
    showCode:       $Boolean,
});

// Creating an object of data kind "FilterData"
export const filterData = FilterData();

export const filter = () => {
    const root = div(
        'Show details: ', $sync(filterData.showDetails, input(typeCheckbox)),
        $if(filterData.showDetails, 
            () => span(
                '   Show parameters description: ', $sync(filterData.showParameters, input(typeCheckbox)),
                '   Show code examples: ', $sync(filterData.showCode, input(typeCheckbox)),
            )
        )
    );
    return root;
}
