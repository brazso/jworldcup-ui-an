import { CommonResponse } from '.';

export interface GenericResponse<T> extends CommonResponse {
  data: T;
}
