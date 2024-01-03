import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Product } from '../../Models/Product';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from 'src/app/services/product.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-product-dashboard',
  templateUrl: './product-dashboard.component.html',
  styleUrls: ['./product-dashboard.component.css']
})
export class ProductDashboardComponent implements OnInit {
  selectedProduct: Product;
  sellerProducts$: Observable<any>;
  @Input() product: Product;
  @Input() searchText: string[] = [];
  @Input() selectedFilterRadioButton: string = "all";
  totalNumberOfProducts: number = 0;
  totalProductUnder100: number = 0;
  totalProductUnder200: number = 0;
  totalProductUnder300: number = 0;
  totalProductUnder400: number = 0;
  totalProductAbove400: number = 0;
  
  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private errorService: ErrorService
    ) {}
  
  ngOnInit(): void {
    this.getSellerProducts();

    // Subscribe to check if seller creates new product. If so, get sellerProducts
    if (this.productService.productCreated) {
      this.productService.productCreated.subscribe((productCreated) => {
        if (productCreated) {
          this.getSellerProducts();
          this.sellerProducts$.subscribe((products) => {
            console.log('Seller product List after product created:', products);
          });
        }
      });
    }

    // Subscribe to check if seller deletes product. If so, get sellerProducts
    if (this.productService.productDeleted) {
      this.productService.productDeleted.subscribe((productDeleted) => {
        if (productDeleted) {
          this.getSellerProducts();
          this.sellerProducts$.subscribe((products) => {
            console.log('Seller product List after product deleted:', products);
          });
        }
      });
    }
  }

  // Get all of the seller products
  getSellerProducts(): void {
    this.sellerProducts$ = this.productService.getSellerProductsInfo().pipe(
      tap((products: Product[]) => {
        this.totalProductUnder100 = products.filter((product) => product.price < 100000).length;
        this.totalProductUnder200 = products.filter((product) => product.price >= 100000 && product.price < 200000).length;
        this.totalProductUnder300 = products.filter((product) => product.price >= 200000 && product.price < 300000).length;
        this.totalProductUnder400 = products.filter((product) => product.price >= 300000 && product.price < 400000).length;
        this.totalProductAbove400 = products.filter((product) => product.price >= 400000).length;
        this.totalNumberOfProducts = products.length;
      }),
      map((result: any) => {
        if (Array.isArray(result)) {
          return result.map(product => ({ ...product, editable: true }));
        } else {
          return [];
        }
      }),
      catchError((error) => {
        if (this.errorService.isAuthError(error.status)) {
          this.errorService.handleSessionExpirationError();
        }
     
        return of([]);
      })
    );
  }
  // Opens product detail modal
  openProductDetail(productData: Product): void {
    console.log('Product data:', productData);
     this.dialog.open(ProductDetailComponent, {
      data: {
        product: productData, 
      },
    });
  }

  // Set search text
  setSearchText(value: string[]){
    this.searchText = value;
 }

 // Set filter
 onFilterChanged(value: string){
  this.selectedFilterRadioButton = value;
}
}
