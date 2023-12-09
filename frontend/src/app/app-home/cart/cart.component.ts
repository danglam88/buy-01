import { Component, EventEmitter, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { Cart } from "src/app/Models/Cart";
import { CartItems } from "src/app/Models/CartItems";
import { CartService } from "src/app/services/cart.service";
import { OrderService } from "src/app/services/order.service";
import { MatDialog } from '@angular/material/dialog';
import { OrderDetailsComponent } from "../my-account/order-details/order-details.component";

@Component({
  selector: "app-cart",
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.css"],
})
export class CartComponent implements OnInit {
  //@Output() orderConfirmation: EventEmitter<Cart> = new EventEmitter<Cart>();
  isCashOnDelivery: boolean = false;
  products: any[] = [];
  cart: Cart = new Cart();
  @Input() productAdded: any;
  itemId: any;

  constructor(private cartService: CartService, private router: Router, private orderService: OrderService, private dialog: MatDialog) {
    this.setCart();
  }
  ngOnInit(): void {
    this.cartService.itemId$.subscribe((itemId) => {
      this.itemId = itemId;
      
    });
    console.log("itemId at ngOnInit: ", this.itemId);
    
  }

  setCart() {
    this.cartService?.getCart().subscribe({
      next: (data: any) => {
        console.log(data);
        this.cart = new Cart();
        this.cart.items = data.map((item: any) => {
          let cartItem = new CartItems(item.product);
          cartItem.product = item.product;
          cartItem.quantity = item.quantity;
          cartItem.price = item.item_price;
          cartItem.itemId = item.itemId;
          //console.log(cartItem.product.id);
          return cartItem;
        });
      },
      error: (error: any) => {
        console.error("Error fetching cart data", error);
      },
    });
  }

  removeFromCart(cartItem: CartItems) {
    this.cartService.removeFromCart(cartItem.itemId).subscribe({
      next: (data: any) => {
        console.log(data);
        this.setCart();
      },
      error: (error: any) => {
        console.error("Error removing item from cart", error);
      },
    });
  }

  changeQuantity(cartItem: CartItems, quantityInString: string) {
    const quantity = parseInt(quantityInString);
    this.cartService?.changeQuantity(cartItem.itemId, cartItem.product.id, quantity).subscribe({
      next: (data: any) => {
        console.log(data);
        this.setCart();
      },
      error: (error: any) => {
        console.error("Error changing quantity", error);
      },
    });
  }

  getQuantityOptions(quantity: number): number[] {
    return new Array(quantity).fill(0).map((_, index) => index + 1);
  }

  checkOut() {
    const orderData = {
      order_status : "CREATED",
      payment_code : "CASH",
    };
    this.orderService.createOrder(orderData).subscribe({
      next: (orderId: string) => {
        console.log("createOrder orderId: ", orderId);
        this.orderService.getOrderByOrderId(orderId).subscribe({
          next: (orderData: any) => {
            console.log("getOrderByOrderId data: ", orderData);
            this.dialog.open(OrderDetailsComponent, {
              data: {
                order: orderData,
                view: 'cart'
              },
            });
            this.router.navigate(["home"]);
          },
          error: (error: any) => {
            console.error("Error fetching order data", error);
          },
        });
      },
      error: (error: any) => {
        console.error("Error creating order", error);
      },
    });
  }

  // get totalPrice(): number {
  //   let totalPrice = 0;
  //   this.items.forEach(items => {
  //       totalPrice += items.price;
  //   });
  //   return totalPrice;
}
