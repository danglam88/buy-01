import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { EncryptionService } from '../services/encryption.service';
import { environment } from '../../environments/environment';
import { AuthenticationService } from './authentication.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  productCreated = new EventEmitter<any>();
  productDeleted = new EventEmitter<any>();
  
  constructor (
    private httpClient: HttpClient,
    private encryptionService: EncryptionService,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  get token() : string {
    const encryptedSecret = localStorage.getItem('srt');
    if (encryptedSecret) {
      try {
        const currentToken = JSON.parse(this.encryptionService.decrypt(encryptedSecret))["token"];
        return currentToken;
      } catch (error) {
        this.authService.logout();
        this.router.navigate(['login']);
      }
    }
    return '';
  }

  // Get all product info
  getAllProductsInfo(): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
     return this.httpClient.get(`${environment.productUrl}`, { headers });
  }

  // Get seller's products
  getSellerProductsInfo(): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
     return this.httpClient.get(`${environment.sellerProductUrl}`, { headers });
  }

  // Create product
  createProduct(product: any): Observable<Object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.httpClient.post(`${environment.productUrl}`, product, { headers });
  }

  // Update product
  updateProduct(product: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.httpClient.put(`${environment.productUrl}/` + product.id, product, { headers });
  }

  // Delete product
  deleteProduct(user: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.httpClient.delete(`${environment.productUrl}/` + user.id, { headers });
  }
}
