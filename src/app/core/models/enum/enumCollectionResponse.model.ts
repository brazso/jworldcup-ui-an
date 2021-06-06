import EnumCollection from './enumCollection.model';
import { CommonResponse } from '../common';

export default interface EnumCollectionResponse extends CommonResponse {
  data: EnumCollection[];
}
