import { Pipe, PipeTransform } from '@angular/core'; 

@Pipe({
    name: 'replaceLineBreaks',
    standalone: false
})
export class ReplaceLineBreaksPipe implements PipeTransform {
    transform(value: string): string {
        return value != undefined ? value.replace(/\n/g, '<br/>') : value;
    }
}