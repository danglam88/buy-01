import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cart } from '../Models/Cart';
import { Product } from '../Models/Product';
import { CartItems } from '../Models/CartItems';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cart: Cart = new Cart();
  cartItemsLength: number;
  private cartItemsSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  addToCart(product: Product):void {
    let CartItem = this.cart.items.find(item => item.product.id === product.id)
    if (CartItem) {
      this.changeQuantity(product.id, CartItem.quantity +1 );
      return;
    }
    this.cart.items.push(new CartItems(product));
    this.updateCartItemsCount();
  }

  removeFromCart(productId: string):void {
    this.cart.items = this.cart.items.filter(item => item.product.id != productId);
    this.updateCartItemsCount();
  }

  changeQuantity(productId: string, quantity:number) {
    let CartItem = this.cart.items.find(item => item.product.id === productId);
    if (!CartItem) return;
    CartItem.quantity=quantity;
    this.updateCartItemsCount();
  }

  getCart(): Cart {
    return this.cart;
  }

  getNumberOfCartItems(): number {
    this.cartItemsLength = this.cart.items.length;
    return this.cartItemsLength;
  }

  getCartItemsObservable(): Observable<number> {
    return this.cartItemsSubject.asObservable();
  }

  private updateCartItemsCount(): void {
    this.cartItemsLength = this.cart.items.length;
    this.cartItemsSubject.next(this.cartItemsLength);
  }
}
