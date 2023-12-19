import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { Cart } from "src/app/Models/Cart";
import { CartItems } from "src/app/Models/CartItems";
import { CartService } from "src/app/services/cart.service";
import { OrderService } from "src/app/services/order.service";
import { MatDialog } from '@angular/material/dialog';
import { OrderDetailsComponent } from "../my-account/order-details/order-details.component";
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map } from "rxjs";

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
  role: string = '';

  constructor(
    private cartService: CartService,
    private router: Router,
    private orderService: OrderService,
    private dialog: MatDialog,
    private userService: UserService,
    private toastr: ToastrService
    ) {

    this.setCart();
  }

  ngOnInit(): void {
    this.userService.userInfoRole$.subscribe((role) => {
      this.role = role;
      console.log("role at ngOnInit: ", this.role);
    });
    this.cartService.itemId$.subscribe((itemId) => {
      this.itemId = itemId;
      console.log("itemId at ngOnInit: ", this.itemId);
    });
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
        setTimeout(() => {
          this.orderService.getOrderByOrderId(orderId).subscribe({
            next: (orderData: any) => {
                this.getOrderDataWithSellerInfo(orderData, (updatedOrderData) => {
                  console.log("Order Data with Seller Info: ", updatedOrderData);
                  this.dialog.open(OrderDetailsComponent, {
                    data: {
                      order: updatedOrderData,
                      view: 'cart',
                      role: 'CLIENT'
                    },
                  });
                });
              this.router.navigate(["home"]);
            },
            error: (error: any) => {
              console.error("Error fetching order data", error);
              this.toastr.error('Order cannot be created');
              this.router.navigate(["home"]);
              
            },
          });
        }, 250);

      },
      error: (error: any) => {
        console.error("Error creating order", error);
      },
    });
  }

  getOrderDataWithSellerInfo(orderData: any, callback: (updatedOrderData: any) => void): void {
    const itemObservables = orderData.items.map((item: any) =>
      this.userService.getUserById(item.seller_id).pipe(
        map((sellerInfo) => ({
          ...item,
          sellerInfo: {
            name: sellerInfo["name"],
            email: sellerInfo["email"],
          },
        }))
      )
    );
  
    forkJoin(itemObservables).subscribe((itemsWithSellerInfo) => {
      const updatedOrderData = {
        ...orderData,
        items: itemsWithSellerInfo,
      };
      callback(updatedOrderData);
    });
  }
}
