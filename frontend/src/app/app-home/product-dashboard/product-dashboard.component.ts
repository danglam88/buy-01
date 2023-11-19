import { Component, OnInit } from '@angular/core';
import { Product } from '../../Models/Product';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from 'src/app/services/product.service';
import { ErrorService } from 'src/app/services/error.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Component({
  selector: 'app-product-dashboard',
  templateUrl: './product-dashboard.component.html',
  styleUrls: ['./product-dashboard.component.css']
})
export class ProductDashboardComponent implements OnInit {
  selectedProduct: Product;
  sellerProducts$: Observable<any>;
  
  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private errorService: ErrorService
    ) {}
  
  ngOnInit(): void {
    this.productService.productCreated$.subscribe(() => this.getSellerProducts());
    this.productService.productDeleted$.subscribe(() => this.getSellerProducts());
    this.getSellerProducts();
  }

  // Get all of the seller products
  getSellerProducts(): void {
    this.sellerProducts$ = this.productService.getSellerProductsInfo().pipe(
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
     this.dialog.open(ProductDetailComponent, {
      data: {
        product: productData, 
      },
    });
  }
}