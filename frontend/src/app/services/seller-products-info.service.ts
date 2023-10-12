import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SellerProductsInfoService {

  constructor(private httpClient: HttpClient) { }

  private sellerProductsInfoUrl="http://localhost:8081/products/seller";

  getSellerProductsInfo(): Observable<object> {

    const token = sessionStorage.getItem('token');

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
     return this.httpClient.get(`${this.sellerProductsInfoUrl}`, { headers });
  }
}
