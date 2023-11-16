import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EncryptionService } from '../services/encryption.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private allProductsInfoUrl="http://localhost:8081/products";
  private sellerProductsInfoUrl="http://localhost:8081/products/seller";
  private createProductUrl="http://localhost:8081/products";
  private updateProductUrl="http://localhost:8081/products/";
  private deleteProductUrl="http://localhost:8081/products/";
  productCreated = new EventEmitter<any>();
  productDeleted = new EventEmitter<any>();

  constructor(private httpClient: HttpClient,
    private encryptionService: EncryptionService,
    private router: Router,
    ) {

  }

  get token() : string {
    const encryptedSecret = sessionStorage.getItem('srt');
    if (encryptedSecret) {
      try {
        const currentToken = JSON.parse(this.encryptionService.decrypt(encryptedSecret))["token"];
        return currentToken;
      } catch (error) {
        this.router.navigate(['../login']);
      }
    }
    return '';
  }

  getAllProductsInfo(): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
     return this.httpClient.get(`${environment.productUrl}`, { headers });
  }

  getSellerProductsInfo(): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
     return this.httpClient.get(`${environment.sellerProductUrl}`, { headers });
  }

  createProduct(product: any): Observable<Object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.httpClient.post(`${environment.productUrl}`, product, { headers });
  }

  updateProduct(product: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.put(`${environment.productUrl}/` + product.id, product, { headers });
  }

  deleteProduct(user: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.delete(`${environment.productUrl}/` + user.id, { headers });
  }

}
