import { Injectable } from '@angular/core';
import { DialogService, DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { TranslocoService } from '@ngneat/transloco';

/**
 * Modal service
 */
@Injectable({
	providedIn: 'root'
})
export class ModalService {

	private activeModalRefs = new Set<DynamicDialogRef>();

	constructor(
		private modalService: DialogService,
		private translocoService: TranslocoService) { }

	/**
	 * Show modal
	 */
	show(content: any, header?: string, data?: any, config?: DynamicDialogConfig): DynamicDialogRef {
		const c: DynamicDialogConfig = config || {};
		if (header) c.header = this.translocoService.translate(header);
		if (data) c.data = data;

		const reference = this.modalService.open(content, c);
		reference.onClose.subscribe(() => {
			this.activeModalRefs.delete(reference);
		});
		this.activeModalRefs.add(reference);
		return reference;
	}

	/**
	 * Hide/close modal
	 */
	hide(modalRef: DynamicDialogRef) {
		modalRef.close();
	}

	/**
	 * Hide/close all modals
	 */
	closeAll() {
		this.activeModalRefs.forEach(ref => ref.close());
	}
}
