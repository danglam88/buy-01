import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { EncryptionService } from './encryption.service';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class OrderItemService {

  // Observable for client cancel item id 
  private itemCancelledSubject = new BehaviorSubject<string>('');
  itemCancelledId$ = this.itemCancelledSubject.asObservable();

  // Observable for client cancels item event
  private isItemCancelledSubject = new BehaviorSubject<boolean>(false);
  isItemCancelled$ = this.isItemCancelledSubject.asObservable();

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

  // Cancel item
  cancelOrderItem(itemId: string, itemData: Object): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
  
    return this.httpClient.put(`${environment.cancelOrderItemUrl}/${itemId}`, itemData, { headers });
  }

  // Reorder item
  redoOrderItem(itemData: Object): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
    const options = {
      headers: headers,
      responseType: "text" as "json", 
    };
  
    return this.httpClient.post(`${environment.redoOrderItemUrl}`, itemData, options);
  }

  updateOrderItemStatus(itemId: string, itemData: Object): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
  
    return this.httpClient.put(`${environment.statusOrderItemUrl}/${itemId}`, itemData, { headers });
  }

  // Emit search query to subscribers
  isCancelItem(itemId: string): void {
    this.itemCancelledSubject.next(itemId);
    this.isItemCancelledSubject.next(true); 
  }
}
