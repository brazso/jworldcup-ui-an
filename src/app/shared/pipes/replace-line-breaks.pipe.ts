import { Pipe } from '@angular/core'; 
@Pipe({ name: 'replaceLineBreaks' })
export class ReplaceLineBreaksPipe {
    transform(value: string): string {
        return value != undefined ? value.replace(/\n/g, '<br/>') : value;
    }
}