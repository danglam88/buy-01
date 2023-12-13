import { Component, Input, OnInit } from '@angular/core';
import { Cart } from 'src/app/Models/Cart';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent implements OnInit {
  //@Input() 
  orderConfirmation!: Cart;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    //this.orderConfirmation = this.cartService.getCart();
    console.log(this.orderConfirmation);
  }
}
