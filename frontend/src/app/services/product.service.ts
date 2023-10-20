import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productList: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private allProductsInfoUrl="http://localhost:8081/products";
  private sellerProductsInfoUrl="http://localhost:8081/products/seller";
  private createProductUrl="http://localhost:8081/products";
  private updateUserUrl="http://localhost:8081/products/";
  private deleteProductUrl="http://localhost:8081/products/";
  private token = sessionStorage.getItem('token');
  productCreated = new EventEmitter<any>();


  constructor(private httpClient: HttpClient) {
    // Load product data from local storage when the service is initialized
    this.loadProductData();
  }

  getAllProductsInfo(): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
     return this.httpClient.get(`${this.allProductsInfoUrl}`, { headers });
  }

  getSellerProductsInfo(): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
     return this.httpClient.get(`${this.sellerProductsInfoUrl}`, { headers });
  }

  createProduct(product: any): Observable<String> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.httpClient.post(`${this.createProductUrl}`, product, { headers, responseType: 'text' });
  }

  updateProduct(product: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.put(`${this.updateUserUrl}` + product.id, product, { headers });
  }

  deleteProduct(user: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.delete(`${this.deleteProductUrl}` + user.id, { headers });
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
