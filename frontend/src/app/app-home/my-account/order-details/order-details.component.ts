import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Product } from 'src/app/Models/Product';
import { OrderItemService } from 'src/app/services/order-item.service';
import { OrderService } from 'src/app/services/order.service';
import { CartService } from 'src/app/services/cart.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';

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
    private orderItemService: OrderItemService,
    private orderService: OrderService,
    private cartService: CartService,
    private dialog: MatDialog,
    private toastr: ToastrService
    ) {
      console.log("OrderDetails data: ", data);
      this.dialogData = data;
    }

  ngOnInit(): void {
    if (this.dialogData.role === 'CLIENT') {
      this.dialogData.order.items.forEach((item) => {
        if (item.status_code !== 'CANCELLED') {
          this.totalSum += item.item_price * item.quantity;
        }
      });
    } else if (this.dialogData.role === 'SELLER') {
      this.totalSum = this.dialogData.order.item_price * this.dialogData.order.quantity;
    }
  }

  redoOrderItem(item: any): void {
    const data = {
      "itemId": item.item_id,
      "orderId": item.order_id,
      "productId": item.product_id,
      "quantity": item.quantity
    };

    this.orderItemService.redoOrderItem(data).subscribe({
      next: (result) => {
        this.cartService.setItemId(result);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        this.toastr.success('Added to Cart');
      }
    });
  }

  cancelOrderItemByClient(item: any): void {
    const data = {
      "productId": item.product_id,
      "orderId": item.order_id,
      "statusCode": "CANCELLED"
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        confirmationText: 'Cancel this order item?'
      }
    });
    dialogRef.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        console.log('Order Item cancelled');
        this.orderItemService.cancelOrderItem(item.item_id, data).subscribe({
          next: () => {
            this.orderService.getOrderByOrderId(item.order_id).subscribe({
              next: (result) => {
                console.log("Order detail after item cancelled: ", result);
                // todo: make it "async"
              },
              error: (error) => {
                console.log(error);
              }
            });
          },
          error: (error) => {
            console.log(error);
          },
          complete: () => {
            this.toastr.success('Order item cancelled successfully', 'Success');
          }
        });
      }
    });
  }

   // Close modal
   closeModal(): void {
    this.dialogRef.close();
  }
}
