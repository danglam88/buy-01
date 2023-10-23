import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productList: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private allProductsInfoUrl="https://localhost:8444/products";
  private sellerProductsInfoUrl="https://localhost:8444/products/seller";
  private createProductUrl="https://localhost:8444/products";
  private updateProductUrl="https://localhost:8444/products/";
  private deleteProductUrl="https://localhost:8444/products/";
  private token = sessionStorage.getItem('token');
  productCreated = new EventEmitter<any>();
  productDeleted = new EventEmitter<any>();

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

  createProduct(product: any): Observable<Object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    return this.httpClient.post(`${this.createProductUrl}`, product, { headers });
  }

  updateProduct(product: any): Observable<object> {
    let headers = new HttpHeaders();
    if (this.token) {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }

    return this.httpClient.put(`${this.updateProductUrl}` + product.id, product, { headers });
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
