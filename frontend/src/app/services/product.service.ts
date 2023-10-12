import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productList: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor() {
    // Load product data from local storage when the service is initialized
    this.loadProductData();
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
