import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { OrderService } from 'src/app/services/order.service';
import { OrderItemService } from 'src/app/services/order-item.service';
import { CartService } from 'src/app/services/cart.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent {
  allTrans$: Observable<any>;
  role: string = '';

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private orderService: OrderService,
    private toastr: ToastrService,
    private orderItemService: OrderItemService,
    private cartService: CartService
  
  ) { }

  ngOnInit(): void {
    this.userService.userInfoRole$.subscribe((role) => {
      this.role = role;
      if (this.role === 'CLIENT') {
        this.getClientOrders();
      } else if (this.role === 'SELLER') {
        this.getSellerOrderItems();
      } 
    });

    // Subscribe to item cancelled event
    this.orderItemService.itemCancelledId$.subscribe((isItemCancelled) => {
      if (isItemCancelled) {
        this.getClientOrders();
      }
    });

    // Subscribe to client update order item status event
    this.orderService.isUpdateOrderItemStatus$.subscribe((isUpdateOrderItemStatus) => {
      if (isUpdateOrderItemStatus) {
        console.log("Update order item status event received")
        this.getSellerOrderItems();
      }
    });
  }

    // Opens product detail modal
    openProductDetail(detail: any): void {
      this.dialog.open(OrderDetailsComponent, {
       data: {
         order: detail,
         role: this.role,
         view: 'history'
       },
     });
   }

   // Get client's orders
   getClientOrders() {
    this.orderService.getClientOrders().subscribe((res) => {
      console.log("Get Client Orders: ", res);
      this.allTrans$ = of(res.orders);
    });
   }

    // Get seller's order items
   getSellerOrderItems() {
    this.orderService.getSellerOrderItems().subscribe((res) => {
      console.log("Get Seller Order Items: ", res);
      this.allTrans$ = of(res.items);
    });
   }

   // Cancel client's order
   cancelOrder(orderId: any) {
    const orderData = {
      order_status : "CANCELLED",
      payment_code : "CASH",
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        confirmationText: 'Cancel this order?'
      }
    });
    dialogRef.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        console.log('Order cancelled');
        this.orderService.cancelOrder(orderId, orderData).subscribe((res) => {
          console.log("Client Cancel Order: ", res);
          this.getClientOrders();
        });
      }
    });
   }

   // Redo client's order
   redoOrder(orderId: string) {
    this.orderService.redoOrder(orderId).subscribe({
      next: (result) => {
        result.forEach((itemId) => {
          setTimeout(() => {
            this.cartService.getCartItem(itemId).subscribe({
              next: (result) => {
                console.log("Cart item after redo: ", result);
                this.cartService.setItemId(itemId);
              },
              error: (error) => {
                console.log(error);
              },
              complete: () => {
                this.toastr.success('Added to Cart');
              }
            });
          }, 250);

        });
      },
      error: (error) => {
        console.log(error);
      }
    });
   }

   // Remove client's order
   removeOrder(orderId: string) {
    this.orderService.removeOrder(orderId).subscribe((res) => {
      console.log(res);
      this.getClientOrders();
      this.toastr.success("Order removed successfully");
    });
   }

   // Update order item status (seller)
   updateOrderItemStatus(item: any, status: string) {
    const itemData = {
      "productId": item.product_id,
      "statusCode": status,
      "orderId": item.order_id
    };

    const action = status === 'CANCELLED' ? 'Cancel' : 'Confirm';

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        confirmationText: action + ' this order item?'
      }
    });
    dialogRef.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.orderItemService.updateOrderItemStatus(item.item_id, itemData).subscribe({
          next: () => {
                this.getSellerOrderItems();
            this.orderService.isUpdateOrderItemStatus();
          },
          error: (error) => {
            console.log(error);
          },
          complete: () => {
            this.toastr.success('Order item ' + status.toLowerCase() + ' successfully', 'Success');
          }
        });
      }
    });
   }
}
