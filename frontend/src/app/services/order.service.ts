import { Injectable } from '@angular/core';
import { Cart } from '../Models/Cart';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EncryptionService } from './encryption.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private cart: Cart = new Cart();
  

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

  createOrder(order: any) {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
  
    // Specify the responseType as 'text'
    const options = {
      headers: headers,
      responseType: 'text' as 'json' // This 'as json' casting is required due to Angular's typing
    };
  
    return this.httpClient.post(`${environment.orderUrl}`, order, options);
  }

  getOrderByOrderId(orderId: string): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
  
    return this.httpClient.get(`${environment.orderUrl}/${orderId}`, { headers });
  }

  getClientOrders(): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
  
    return this.httpClient.get(`${environment.clientOrderUrl}`, { headers });
  }

  getSellerOrders(): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
  
    return this.httpClient.get(`${environment.sellerOrderUrl}`, { headers });
  }

  cancelOrder(orderId: string, orderData: Object): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
  
    return this.httpClient.put(`${environment.orderUrl}/${orderId}`, orderData, { headers });
  }

  removeOrder(orderId: string): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
  
    return this.httpClient.delete(`${environment.orderUrl}/${orderId}`, { headers });
  }
}
