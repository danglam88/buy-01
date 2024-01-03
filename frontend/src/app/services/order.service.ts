import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { EncryptionService } from './encryption.service';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  // Observable for seller update order item status 
  private isUpdateOrderItemStatusSubject = new BehaviorSubject<boolean>(false);
  isUpdateOrderItemStatus$ = this.isUpdateOrderItemStatusSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
    private encryptionService: EncryptionService,
    private authService: AuthenticationService
  ) {}

  get token(): string {
    const encryptedSecret = localStorage.getItem("srt");
    if (encryptedSecret) {
      try {
        const currentToken = JSON.parse(
          this.encryptionService.decrypt(encryptedSecret)
        )["token"];
        return currentToken;
      } catch (error) {
        this.authService.logout();
      }
    }
    return "";
  }

  // Create order
  createOrder(order: any) {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
  
    const options = {
      headers: headers,
      responseType: 'text' as 'json' 
    };
  
    return this.httpClient.post(`${environment.orderUrl}`, order, options);
  }

  // Get order by orderId
  getOrderByOrderId(orderId: string): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
  
    return this.httpClient.get(`${environment.orderUrl}/${orderId}`, { headers });
  }

  // Get client orders
  getClientOrders(): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
  
    return this.httpClient.get(`${environment.clientOrderUrl}`, { headers });
  }

  // Get seller orders
  getSellerOrderItems(): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
  
    return this.httpClient.get(`${environment.sellerOrderUrl}`, { headers });
  }

  // Cancel client's order
  cancelOrder(orderId: string, orderData: Object): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
  
    return this.httpClient.put(`${environment.orderUrl}/${orderId}`, orderData, { headers });
  }

  // Remove client's order
  removeOrder(orderId: string): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
  
    return this.httpClient.delete(`${environment.orderUrl}/${orderId}`, { headers });
  }

  // Redo order (by cient)
  redoOrder(orderId: string): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }

    const options = { headers: headers };
  
    return this.httpClient.post<string[]>(`${environment.redoOrderUrl}`, orderId, options);
  }

  // Emit cancel order to subscribers
  isUpdateOrderItemStatus(): void {
    this.isUpdateOrderItemStatusSubject.next(true); 
  }
}
