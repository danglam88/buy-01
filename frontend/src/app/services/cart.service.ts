import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Cart } from "../Models/Cart";
import { Product } from "../Models/Product";
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
  private itemId = new BehaviorSubject<object>({itemId: ""});
  itemId$ = this.itemId.asObservable();

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

  //update quantity in a product
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

  //get all items in cart
  getCart(): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
    return this.httpClient.get(`${environment.orderItemUrl}`, { headers });
  }

  //remove a product from cart
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

  setItemId(itemId: any): void {
    this.itemId.next(itemId);
  }
}
