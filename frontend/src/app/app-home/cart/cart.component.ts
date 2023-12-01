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
  cart :Cart = new Cart();
  constructor (private cartService: CartService,
    private router: Router) {
    this.setCart();
  }
  ngOnInit():void {

  }



  setCart() {
    this.cartService?.getCart().subscribe(
      (data: any) => {
        console.log(data);
        this.cart = new Cart();
        this.cart.items = data.map((item: any) => {
          let cartItem = new CartItems(item.product);
          cartItem.product = item.product;
          cartItem.quantity = item.quantity;
          cartItem.price = item.item_price;
          console.log(cartItem.product.id);
          return cartItem;
        });
      },
      error => {
        console.error("Error fetching cart data", error);
      }
    );
  }
  

  removeFromCart(cartItem: CartItems) {
    this.cartService.removeFromCart(cartItem.product.id);
    this.setCart();
  }

  changeQuantity(cartItem: CartItems, quantityInString: string) {
    console.log(cartItem.product.id);
    const quantity = parseInt(quantityInString);
    this.cartService?.changeQuantity(cartItem.product.id, quantity).subscribe( {
      next: (data: any) => {
        console.log(data);
        this.setCart();
      },
      error: (error: any) => {
        console.error("Error changing quantity", error);
      }
    }
    );

  }

  getQuantityOptions(quantity: number): number[] {
    return new Array(quantity).fill(0).map((_, index) => index + 1);
  }

  checkOut(cart: Cart) {
    this.cartService.setCurrentCart(cart);
    this.router.navigate(['/order-confirmation']);
    // this.orderConfirmation.emit(cart);
  }

  // get totalPrice(): number {
  //   let totalPrice = 0;
  //   this.items.forEach(items => {
  //       totalPrice += items.price;
  //   });
  //   return totalPrice;
}
  

