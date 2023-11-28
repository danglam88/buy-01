import { Component, Input, OnInit  } from '@angular/core';
import { Product } from '../../Models/Product';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from 'src/app/services/product.service';
import { ErrorService } from 'src/app/services/error.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-product-listing',
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.css'],
})
export class ProductListingComponent implements OnInit {
  allProducts$: Observable<any>;
  @Input() product: Product;
  @Input() searchText: string[] = [];

  constructor( 
    private dialog: MatDialog, 
    private productService: ProductService,
    private errorService: ErrorService,
    ) {
      
    }
  
  ngOnInit(): void {
    this.getAllProducts();

    if (this.productService.productCreated) {
      this.productService.productCreated.subscribe((productCreated) => {
        if (productCreated) {
          this.getAllProducts();
        }
      });
    }
  }

  getAllProducts(){
    this.allProducts$ = this.productService.getAllProductsInfo().pipe(      
      catchError((error) => {
        if (this.errorService.isAuthError(error.status)) {
          this.errorService.handleSessionExpirationError();
        }
        // Return an empty observable or default value to avoid breaking the chain
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

  // creating reference of productListComponent 
 
  setSearchText(value: string[]){
     this.searchText = value;
  }
  
  
  selectedFilterRadioButton: string = "all";

  onFilterChanged(value: string){
    console.log("value" + value)
    this.selectedFilterRadioButton = value;
    console.log("onFilterChanged called" + this.selectedFilterRadioButton)
  }
}
