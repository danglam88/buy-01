import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Cart } from "../Models/Cart";
import { Product } from "../Models/Product";
import { CartItems } from "../Models/CartItems";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { EncryptionService } from "./encryption.service";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class CartService {
  private currentCart: Cart;
  private cart: Cart = new Cart();
  cartItemsLength: number;
  private cartItemsSubject: BehaviorSubject<number> =
    new BehaviorSubject<number>(0);

  constructor(
    private http: HttpClient,
    private encryptionService: EncryptionService,
    private router: Router
  ) {}

  get token(): string {
    const encryptedSecret = sessionStorage.getItem("srt");
    if (encryptedSecret) {
      try {
        const currentToken = JSON.parse(
          this.encryptionService.decrypt(encryptedSecret)
        )["token"];
        return currentToken;
      } catch (error) {
        this.router.navigate(["../login"]);
      }
    }
    return "";
  }


//function to add a product to cart
  addToCart(product: Product): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
    let defaultItem = {
      productId: product.id,
      quantity: 1,
    };
    return this.http.post(`${environment.orderItemUrl}`, defaultItem, { headers });
  }

  //update quantity in a product
  changeQuantity(productId: string, quantity: number) {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
    let defaultItem = {
      productId: productId,
      quantity: quantity,
    };
    return this.http.put(`${environment.orderItemUrl}/` + productId, defaultItem, { headers });
  }

  //get all items in cart
  getCart(): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
    return this.http.get(`${environment.orderItemUrl}`, { headers });
  }

  removeFromCart(productId: string): void {
    this.cart.items = this.cart.items.filter(
      (item) => item.product.id != productId
    );
    this.updateCartItemsCount();
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

  //for testing for the order confirmation

  setCurrentCart(cart: Cart): void {
    this.currentCart = cart;
  }

  getCurrentCart(): Cart {
    return this.currentCart;
  }
}
