import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreateProductService {

  constructor(private httpClient: HttpClient) { }

  private createProductUrl="http://localhost:8081/products";

  createProduct(product: any): Observable<object> {
    const token = sessionStorage.getItem('token');

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.httpClient.post(`${this.createProductUrl}`, product, { headers });
  }
}
