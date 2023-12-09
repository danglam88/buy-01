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
  allOrders: any[] = [];
  userInfoRole: string = '';

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private orderService: OrderService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {

    this.userService.userInfoRole$.subscribe((role) => {
      this.userInfoRole = role;
      // Do something with the updated role, for example, update your view
    });

    if (this.userInfoRole === 'CLIENT') {
      this.getClientOrders();
    } else if (this.userInfoRole === 'SELLER') {
      this.getSellerOrders();
    }
  }

    // Opens product detail modal
    openProductDetail(order: any): void {
      this.dialog.open(OrderDetailsComponent, {
       data: {
         order: order,
         view: 'order'
       },
     });
   }

   getClientOrders() {
    this.orderService.getClientOrders().subscribe((res) => {
      console.log(res);
      this.allOrders = res.orders;
    });
   }

   getSellerOrders() {
    this.orderService.getSellerOrders().subscribe((res) => {
      console.log(res);
      this.allOrders = res.orders;
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
