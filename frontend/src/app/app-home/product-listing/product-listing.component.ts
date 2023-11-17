import { Component, OnInit  } from '@angular/core';
import { Product } from '../../Models/Product';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from 'src/app/services/product.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-product-listing',
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.css'],
})
export class ProductListingComponent implements OnInit {
  selectedProduct: Product;
  products: any = [];

  constructor(
    private dialog: MatDialog, 
    private productService: ProductService,
    private errorService: ErrorService,
    ) {
      this.productService.productCreated.subscribe((productCreated) => {
        if (productCreated) {
          this.getAllProducts();
        }
      });
    }
  
  ngOnInit(): void {
    // Get all products and display them
    this.getAllProducts();
  }

  getAllProducts(){
    this.productService?.getAllProductsInfo().subscribe({
      next: (result) => {
        this.products = result;
      },
      error: (error) => {
        if (this.errorService.isAuthError(error.status)) {
          this.errorService.handleSessionExpirationError();
        }
      },
      complete: () => {
        console.log("All products retrieved");
      }
    });
  }

  // Open productDetail modal
  openProductDetail(productData: Product): void {
     this.dialog.open(ProductDetailComponent, {
      data: {
        product: productData, 
      },
    });
  }
}
