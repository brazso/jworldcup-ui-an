import { CommonResponse } from '.';

export interface GenericMapResponse</*K = string | number | symbol,*/ T = any> extends CommonResponse {
//   data: Map<K, T>; // cannot be used here because object dictionary comes in rest repsonse not a map
  data: { [key: string]: T }; // index signature (key type) can be only string | number | symbol but not a generic
}
