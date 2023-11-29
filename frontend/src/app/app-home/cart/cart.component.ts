import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Cart } from 'src/app/Models/Cart';
import { CartItems } from 'src/app/Models/CartItems';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  //@Output() orderConfirmation: EventEmitter<Cart> = new EventEmitter<Cart>();
  products: any[] = [];
  cart! :Cart;
  constructor (private cartService: CartService,
    private router: Router) {
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

  checkOut(cart: Cart) {
    this.cartService.setCurrentCart(cart);
    this.router.navigate(['/order-confirmation']);
    // this.orderConfirmation.emit(cart);
  }
  
}
