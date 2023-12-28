import { Component, Input } from '@angular/core';
import { OrderService } from 'src/app/services/order.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent {
  topProducts: any[] = [];
  totalAmount: number = 0;
  @Input() role: string = "";
  constructor(
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
   
    if (this.role === 'CLIENT') {
      this.getClientStats();
    } else if (this.role === 'SELLER') {
      this.getSellerStats();
    }
  }

  getClientStats() {
    this.orderService.getClientOrders().subscribe((res) => {
      console.log(res);
      this.topProducts = res.top_products;
      this.totalAmount = res.total_amount;
    });
  }

  getSellerStats() {
    this.orderService.getSellerOrderItems().subscribe((res) => {
      console.log(res);
      this.topProducts = res.top_products;
      this.totalAmount = res.total_amount;
    });
  }
}
