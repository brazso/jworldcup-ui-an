export interface IBaseMessage {
  header?: string;
  body: string;
  okButtonLabel?: string;
}

export interface IModalData extends IBaseMessage {
  modalType: ModalTypes;
}

export enum ModalTypes {
  INFO = 'INFO',
  ERROR = 'ERROR'
}
