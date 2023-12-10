import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product } from 'src/app/Models/Product';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  @Input() product: Product;
  dialogData: any;
  totalSum: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<OrderDetailsComponent>,
    ) {
      console.log("OrderDetails data: ", data);
      this.dialogData = data;
    }

  ngOnInit(): void {
    if (this.dialogData.role === 'CLIENT') {
      this.dialogData.order.items.forEach((item) => {
        this.totalSum += item.item_price * item.quantity;
      });
    } else if (this.dialogData.role === 'SELLER') {
      this.totalSum = this.dialogData.order.item_price * this.dialogData.order.quantity;
    }
  }

   // Close modal
   closeModal(): void {
    this.dialogRef.close();
  }
}
