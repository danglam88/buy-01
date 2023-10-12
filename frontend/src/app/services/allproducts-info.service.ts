import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AllproductsInfoService {

  constructor(private httpClient: HttpClient) { }

  private allProductsInfoUrl="http://localhost:8081/products";

  getAllProductsInfo(): Observable<object> {

    const token = sessionStorage.getItem('token');

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
     return this.httpClient.get(`${this.allProductsInfoUrl}`, { headers });
  }
}