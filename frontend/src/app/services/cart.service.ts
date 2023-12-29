import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Router } from "@angular/router";

import { Product } from "../Models/Product";
import { environment } from "../../environments/environment";
import { EncryptionService } from "./encryption.service";
import { CartItems } from "../Models/CartItems";

@Injectable({
  providedIn: "root",
})
export class CartService {
  cartItemsLength: number;
  cart: CartItems[] = [];

  private itemId = new BehaviorSubject<object>({ itemId: "" });
  itemId$ = this.itemId.asObservable();

  private cartUpdateSubject = new BehaviorSubject<boolean>(false);
  cartUpdate$ = this.cartUpdateSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
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

  // Add product to cart
  addToCart(product: Product): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
    let defaultItem = {
      productId: product.id,
      quantity: 1,
    };
    const options = {
      headers: headers,
      responseType: "text" as "json", // This 'as json' casting is required due to Angular's typing
    };
    return this.httpClient.post(
      `${environment.orderItemUrl}`,
      defaultItem,
      options
    );
  }

  // Update quantity in a product
  changeQuantity(itemId: string, productId: string, quantity: number) {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
    let defaultItem = {
      productId: productId,
      quantity: quantity,
    };
    return this.httpClient.put(
      `${environment.orderItemUrl}` + `/${itemId}`,
      defaultItem,
      { headers }
    );
  }

  // Get all items in cart
  getCart(): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
    return this.httpClient.get(`${environment.orderItemUrl}`, { headers });
  }

  // Get a specific item in cart
  getCartItem(itemId: string): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
    return this.httpClient.get(`${environment.orderItemUrl}` + `/${itemId}`, {
      headers,
    });
  }

  // Remove a product from cart
  removeFromCart(itemId: string): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
    return this.httpClient.delete(
      `${environment.orderItemUrl}` + `/${itemId}`,
      { headers }
    );
  }

  setItemId(itemId: any): void {
    this.itemId.next(itemId);
  }

  isItemAddedToCart(added: boolean): void {
    this.cartUpdateSubject.next(added);
  }

  setCartItems(cartItems: Iterable<CartItems>): void {
    for (const item of cartItems) {
      this.cart.push(item);
    }
  }

  getCartItems(): CartItems[] {
    return this.cart;
  }

  removeCartItems(cartItemId: string): void {
    this.cart = this.cart.filter((item) => item.itemId !== cartItemId);
  }

  clearCart(): void {
    this.cart = [];
  }
}
