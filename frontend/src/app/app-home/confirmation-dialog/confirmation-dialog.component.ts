import { Component, Inject  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent {

  // Confirmation dialogue used for when deleting product, product image, and user account
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: { confirmationText: string }) {}

  closeDialog(confirm: boolean): void {
    this.dialogRef.close(confirm);
  }
}
