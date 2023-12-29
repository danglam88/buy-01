import { Component, Input, OnInit  } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Product } from '../../Models/Product';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from 'src/app/services/product.service';
import { ErrorService } from 'src/app/services/error.service';
import { Cart } from 'src/app/Models/Cart';

@Component({
  selector: 'app-product-listing',
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.css'],
})
export class ProductListingComponent implements OnInit {
  allProducts$: Observable<any>;
  @Input() product: Product;
  @Input() searchText: string[] = [];
  @Input() selectedFilterRadioButton: string = "all";
  totalProductUnder100: number = 0;
  totalProductUnder200: number = 0;
  totalProductUnder300: number = 0;
  totalProductUnder400: number = 0;
  totalProductAbove400: number = 0;
  cartItems: Cart[] = [];

  constructor( 
    private dialog: MatDialog, 
    private productService: ProductService,
    private errorService: ErrorService,
    ) {
    }
  
  ngOnInit(): void {
    this.getAllProducts();

    // Subscribe to check if product is created and getAllProducts
    if (this.productService.productCreated) {
      this.productService.productCreated.subscribe((productCreated) => {
        if (productCreated) {
          this.getAllProducts();
        }
      });
    }
  }

  // Display all products and assign product price accordingly for filter
  getAllProducts(){
    this.allProducts$ = this.productService.getAllProductsInfo().pipe(  
      tap((products: Product[]) => {
        this.totalProductUnder100 = products.filter((product) => product.price < 100).length;
        this.totalProductUnder200 = products.filter((product) => product.price >= 100 && product.price < 200).length;
        this.totalProductUnder300 = products.filter((product) => product.price >= 200 && product.price < 300).length;
        this.totalProductUnder400 = products.filter((product) => product.price >= 300 && product.price < 400).length;
        this.totalProductAbove400 = products.filter((product) => product.price >= 400).length;
      }), 
      catchError((error) => {
        if (this.errorService.isAuthError(error.status)) {
          this.errorService.handleSessionExpirationError();
        }
        return of([]);
      })
    );
  }

  // Open productDetail modal
  openProductDetail(productData: Product): void {
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
