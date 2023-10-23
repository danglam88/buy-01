import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Product } from '../../Models/Product';
import { CreateProductComponent } from '../create-product/create-product.component';
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
    private dialog: MatDialog,
    private productService: ProductService
    ) {
      this.productService.productCreated.subscribe((productCreated) => {
        if (productCreated) {
          console.log("Product created")
          this.getSellerProducts();
        }
      });

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
      complete: () => {
       // console.log("All products retrieved");
      }
    });
  }

  openCreateProduct(): void {
     this.dialog.open(CreateProductComponent, {
    });
  }

  openProductDetail(productData: Product): void {
     this.dialog.open(ProductDetailComponent, {
      data: {
        product: productData, 
      },
    });
  }
}