import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EncryptionService } from './encryption.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

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

  cancelOrderItem(itemId: string, itemData: Object): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }
  
    return this.httpClient.put(`${environment.cancelOrderItemUrl}/${itemId}`, itemData, { headers });
  }

  redoOrderItem(itemData: Object): Observable<any> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set("Authorization", `Bearer ${this.token}`);
    }

    // Specify the responseType as 'text'
    const options = {
      headers: headers,
      responseType: "text" as "json", // This 'as json' casting is required due to Angular's typing
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
