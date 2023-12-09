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
  order: any;
  orderItems: any[] = [];
  orderTotal: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<OrderDetailsComponent>,
    ) {
      console.log("OrderDetails data: ", data);
      this.order = data.order;
      this.orderItems = data.order.items;
    }

  ngOnInit(): void {
    console.log(this.orderItems);
    this.orderItems.forEach((item) => {
      this.orderTotal += item.item_price * item.quantity;
    });
  }

   // Close modal
   closeModal(): void {
    this.dialogRef.close();
  }
}
