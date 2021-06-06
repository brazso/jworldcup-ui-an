import { CommonResponse } from '.';

export interface GenericListResponse<T> extends CommonResponse {
  data: Array<T>;
}
