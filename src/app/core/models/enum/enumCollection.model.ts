import Emun from './emun.model';

export default class EnumCollection {
  name: string;
  field: string;
  values: Emun[];

  constructor(name: string, field: string, values: Emun[]) {
    this.name = name;
    this.field = field;
    this.values = values;
  }
}
