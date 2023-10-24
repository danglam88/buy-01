import { Component, OnInit } from '@angular/core';
import { Product } from '../../Models/Product';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from 'src/app/services/product.service';


@Component({
  selector: 'app-product-dashboard',
  templateUrl: './product-dashboard.component.html',
  styleUrls: ['./product-dashboard.component.css']
})
export class ProductDashboardComponent implements OnInit {
  selectedProduct: Product;
  sellerProducts: any = [];
  
  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    ) {
      // Handle product creation and get seller's products again
      this.productService.productCreated.subscribe((productCreated) => {
        if (productCreated) {
          console.log("Product created")
          this.getSellerProducts();
        }
      });

      // Handle product deletion and get the seller's products again
      this.productService.productDeleted.subscribe((deleteCreated) => {
        if (deleteCreated) {
          console.log("Product deleted")
          this.getSellerProducts();
        }
      });
    }
  
  ngOnInit(): void {
    this.getSellerProducts();
  }

  // Get all of the seller products
  getSellerProducts(){
    this.productService.getSellerProductsInfo().subscribe({
      next: (result) => {
        this.sellerProducts = result;
      },
      error: (error) => {
        console.log(error);
        if (error.status == 404) {
          console.log("Products not found");
        }
      },
    });
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