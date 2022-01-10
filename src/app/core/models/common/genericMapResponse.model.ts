import { CommonResponse } from '.';

export interface GenericMapResponse</*K = string | number | boolean,*/ T = any> extends CommonResponse {
//   data: Map<K, T>; // cannot be used here because dictionary comes in rest repsonse
  data: { [key: string]: T }; // index signature (key type) can be only string | number | boolean and not generic
}
