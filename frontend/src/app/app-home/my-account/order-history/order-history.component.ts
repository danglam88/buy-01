import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { OrderService } from 'src/app/services/order.service';
import { OrderItemService } from 'src/app/services/order-item.service';
import { CartService } from 'src/app/services/cart.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { Observable, forkJoin, map, mergeMap, of, switchMap } from 'rxjs';

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
        this.getClientOrdersWithSellerInfo();
      } else if (this.role === 'SELLER') {
        this.getSellerOrderItems();
      } 
    });

    // Subscribe to item cancelled event
    this.orderItemService.itemCancelledId$.subscribe((isItemCancelled) => {
      if (isItemCancelled) {
        this.getClientOrdersWithSellerInfo();
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
  //  getClientOrders() {
  //   this.getClientOrdersWithSellerInfo();
  // }

  getClientOrdersWithSellerInfo(){
    this.orderService.getClientOrders().pipe(
      switchMap((res) => {
        const itemObservables = res.orders.map((order: any) =>
          forkJoin(
            order.items.map((item: any) =>
              this.userService.getUserById(item.seller_id).pipe(
                map((sellerInfo) => ({
                  ...item,
                  sellerInfo: {
                    name: sellerInfo["name"],
                    email: sellerInfo["email"],
                  },
                }))
              )
            )
          ).pipe(
            map((itemsWithSellerInfo) => ({
              ...order,
              items: itemsWithSellerInfo,
            }))
          )
        );
        return forkJoin(itemObservables).pipe(
          map((ordersWithSellerInfo) => ({
            ...res,
            orders: ordersWithSellerInfo,
          }))
        );
      }),
      mergeMap((result) => of(result))
    ).subscribe((result) => {
      console.log("Get Client Orders: ", result);
      this.allTrans$ = of(result.orders);
    });
  } 

    // Get seller's order items
   getSellerOrderItems() {
    this.orderService.getSellerOrderItems().pipe(
      switchMap((res) => {
        const itemObservables = res.items.map((item: any) =>
          this.userService.getUserById(item.buyer_id).pipe(
            map((buyerInfo) => ({
              ...item,
              buyerInfo: {
                name: buyerInfo["name"],
                email: buyerInfo["email"],
              },
            }))
          )
        );
        return forkJoin(itemObservables).pipe(
          map((itemsWithBuyerInfo) => ({
            ...res,
            items: itemsWithBuyerInfo,
          }))
        );
      }),
      mergeMap((result) => of(result))
    ).subscribe((result) => {
      console.log("Get Seller Order Items: ", result);
      this.allTrans$ = of(result.items);
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
        this.orderService.cancelOrder(orderId, orderData).subscribe((res) => {
          //this.getClientOrders();
          this.getClientOrdersWithSellerInfo();
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
     // this.getClientOrdersWithSellerInfo();
     this.orderService.getClientOrders().pipe(
      switchMap((res) => {
        const itemObservables = res.orders.map((order: any) =>
          forkJoin(
            order.items.map((item: any) =>
              this.userService.getUserById(item.seller_id).pipe(
                map((sellerInfo) => ({
                  ...item,
                  sellerInfo: {
                    name: sellerInfo["name"],
                    email: sellerInfo["email"],
                  },
                }))
              )
            )
          ).pipe(
            map((itemsWithSellerInfo) => ({
              ...order,
              items: itemsWithSellerInfo,
            }))
          )
        );
        return forkJoin(itemObservables).pipe(
          map((ordersWithSellerInfo) => ({
            ...res,
            orders: ordersWithSellerInfo,
          }))
        );
      }),
      mergeMap((result) => of(result))
    ).subscribe((result) => {
      console.log("Get Client Orders: ", result);
      this.allTrans$ = of(result.orders);
    });
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
               setTimeout(() => {
                this.getSellerOrderItems();
               }, 250);
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
