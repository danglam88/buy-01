import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EncryptionService } from '../services/encryption.service';
import { Router } from '@angular/router';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productList: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  productCreated = new EventEmitter<any>();
  productDeleted = new EventEmitter<any>();

  constructor(private httpClient: HttpClient,
    private encryptionService: EncryptionService,
    private router: Router,
    ) {
    // Load product data from local storage when the service is initialized
    this.loadProductData();
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

  // Get the product list as an observable
  getProductListObservable() {
    return this.productList.asObservable();
  }

  // Get the current product list
  getProductList() {
    return this.productList.getValue();
  }

  // Set the product list and update the local storage
  setProductList(products: any[]) {
    this.productList.next(products);
    this.saveProductData(products);
  }

  // Add a new product to the list
  addProduct(product: any) {
    const products = this.getProductList();
    products.push(product);
    this.setProductList(products);
  }

  // Load product data from local storage
  loadProductData() {
    const savedProducts = localStorage.getItem('products');

    if (savedProducts) {
      const products = JSON.parse(savedProducts);
      this.setProductList(products);
    }
  }

  // Save product data to local storage
  saveProductData(products: any[]) {
    localStorage.setItem('products', JSON.stringify(products));
  }
}
