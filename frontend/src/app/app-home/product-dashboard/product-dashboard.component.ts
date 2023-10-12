import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Product } from '../../Models/Product';
import { CreateProductComponent } from '../create-product/create-product.component';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { SellerProductsInfoService } from 'src/app/services/seller-products-info.service';

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
    private sellerProductsInfoService: SellerProductsInfoService
    ) {}
  
  ngOnInit(): void {
    this.sellerProductsInfoService.getSellerProductsInfo().subscribe({
      next: (result) => {
        console.log(result);
        this.sellerProducts = result;
      },
      error: (error) => {
        console.log(error);
        if (error.status == 404) {
          console.log("Products not found");
        }
      },
      complete: () => {
        console.log("All products retrieved");
      }
    });
  }

  openCreateProduct(): void {
     this.dialog.open(CreateProductComponent, {
    });
  }

  openProductDetail(productData: Product): void {
    console.log(productData)
     this.dialog.open(ProductDetailComponent, {
      data: {
        product: productData, 
      },
    });
  }
}