import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent {
  allOrders: any[] = [];
  userInfoRole: string = '';

  constructor(private userService: UserService, private dialog: MatDialog, private orderService: OrderService) { }

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
}
