import { Component, OnInit, Input } from '@angular/core';
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
  @Input() product: Product;
  @Input() searchText: string[] = [];
  @Input() selectedFilterRadioButton: string = "all";
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

  setSearchText(value: string[]){
    this.searchText = value;
 }

 onFilterChanged(value: string){
  this.selectedFilterRadioButton = value;
}
}
