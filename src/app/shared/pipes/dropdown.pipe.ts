import { Pipe, PipeTransform } from '@angular/core';
import { SelectItem } from 'primeng/api';

export interface DropdownPipeOptions {
    /**
     * Label property name. Default is 'label'.
     */
    labelKey?: string;
    /**
     * Is there an empty null row as first one? Default is true.
     */
    withEmpty?: boolean;
    /**
     * Empty null row label. Default is '-'.
     */
    emptyLabel?: string;
}

@Pipe({ name: 'dropdown' })
export class DropdownPipe implements PipeTransform {

transform(array: any[], options: DropdownPipeOptions = {}): SelectItem[] {
    // console.log(`dropdown.pipe/transform array: ${JSON.stringify(array)}, options: ${JSON.stringify(options)}`);
    if(!array) {
        return [];
    }
  
    const pipeArray = array.map(e => ({ label: e[options.labelKey ?? 'label'], value: e } as SelectItem));
    if (options.withEmpty ?? true) {
        pipeArray.unshift({label: options.emptyLabel ?? '-', value: null});
    }
    // console.log(`dropdown.pipe/pipeArray: ${JSON.stringify(pipeArray)}`);

    return pipeArray;
}
}
