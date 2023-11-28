import { Component, OnInit } from '@angular/core';
import { Cart } from 'src/app/Models/Cart';
import { CartItems } from 'src/app/Models/CartItems';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  products: any[] = [];
  cart! :Cart;
  constructor (private cartService: CartService) {
    this.setCart();
  }
  ngOnInit():void {
  
  }

  setCart() {
    this.cart=this.cartService.getCart();
  }

  removeFromCart(cartItem: CartItems) {
    this.cartService.removeFromCart(cartItem.product.id);
    this.setCart();
  }

  changeQuantity(cartItem: CartItems, quantityInString: string) {
    const quantity = parseInt(quantityInString);
    this.cartService.changeQuantity(cartItem.product.id, quantity);
    this.setCart();
  }

  getQuantityOptions(quantity: number): number[] {
    return new Array(quantity).fill(0).map((_, index) => index + 1);
  }

  
}
