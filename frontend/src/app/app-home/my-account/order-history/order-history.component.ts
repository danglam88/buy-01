import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { OrderService } from 'src/app/services/order.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent {
  allTrans: any[] = [];
  role: string = '';

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private orderService: OrderService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.userService.userInfoRole$.subscribe((role) => {
      this.role = role;
      // Do something with the updated role, for example, update your view
    });

    if (this.role === 'CLIENT') {
      this.getClientOrders();
    } else if (this.role === 'SELLER') {
      this.getSellerOrderItems();
    }
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

   getClientOrders() {
    this.orderService.getClientOrders().subscribe((res) => {
      console.log(res);
      this.allTrans = res.orders;
    });
   }

   getSellerOrderItems() {
    this.orderService.getSellerOrderItems().subscribe((res) => {
      console.log(res);
      this.allTrans = res.items;
    });
   }

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
          console.log(res);
          this.getClientOrders();
        });
      }
    });
   }

   removeOrder(orderId: any) {
    this.orderService.removeOrder(orderId).subscribe((res) => {
      console.log(res);
      this.getClientOrders();
      this.toastr.success("Order removed successfully");
    });
   }
}
