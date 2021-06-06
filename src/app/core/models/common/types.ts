import Enum from '../enum/emun.model';

export type EnumMap = {
  [key in string]: Array<Enum>;
};
