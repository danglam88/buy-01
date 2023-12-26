import { Component, Input, OnInit  } from '@angular/core';
import { Product } from '../../Models/Product';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from 'src/app/services/product.service';
import { ErrorService } from 'src/app/services/error.service';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Cart } from 'src/app/Models/Cart';
import { CartService } from 'src/app/services/cart.service';

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
  isProductInCart: boolean = false;
  cartItems: Cart[] = [];

  constructor( 
    private dialog: MatDialog, 
    private productService: ProductService,
    private errorService: ErrorService,
    private cartService: CartService,
    ) {
     // get the total number of products under 100 from object Product
    }
  
  ngOnInit(): void {
    this.getAllProducts();
    // console.log('get all cart', this.cartService.getCartItems());


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
 
  setSearchText(value: string[]){
     this.searchText = value;
  }

  onFilterChanged(value: string){
    this.selectedFilterRadioButton = value;
  }
}
