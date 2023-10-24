import { Component, OnInit } from '@angular/core';
import { Product } from '../../Models/Product';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from 'src/app/services/product.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


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
    private router: Router,
    private toastr: ToastrService
    ) {
      this.toastr.toastrConfig.positionClass = 'toast-bottom-right';
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
        // loop through the products and add an editable property
        this.sellerProducts.forEach((product) => {
          product.editable = true;
        });
      },
      error: (error) => {
        if (error.status == 401 || error.status == 403) {
          this.toastr.error('Operation not permitted. Log in again.');
          this.router.navigate(['../login']);
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