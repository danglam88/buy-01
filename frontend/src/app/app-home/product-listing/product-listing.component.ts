import { Component, EventEmitter, Input, OnInit, Output  } from '@angular/core';
import { Product } from '../../Models/Product';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from 'src/app/services/product.service';
import { ErrorService } from 'src/app/services/error.service';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { Media } from 'src/app/Models/Media';
import { MediaService } from 'src/app/services/media.service';

@Component({
  selector: 'app-product-listing',
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.css'],
})
export class ProductListingComponent implements OnInit {
  allProducts$: Observable<any>;
  @Input() product: Product;
  private mediaArray: Media[] = [];
  
  constructor( 
    private dialog: MatDialog, 
    private productService: ProductService,
    private errorService: ErrorService,
    private mediaService: MediaService
    ) {
      
    }
  
  ngOnInit(): void {
    this.getAllProducts();

    this.productService.productCreated.subscribe((productCreated) => {
      if (productCreated) {
        this.getAllProducts();
        this.allProducts$.subscribe((products) => {
          console.log('Product List after product created:', products);
        });
      }
    });
    
    this.allProducts$.subscribe((products) => {
      console.log('Product List:', products);
    });
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
 /* getAllProducts() {
    this.allProducts$ = this.productService.getAllProductsInfo().pipe(
      catchError((error) => {
        // Handle errors
        if (this.errorService.isAuthError(error.status)) {
          this.errorService.handleSessionExpirationError();
        }
        return of([]);
      }),
      switchMap((products) => {
        // Ensure that products is an array before using map
        const productArray = Array.isArray(products) ? products : [];
  
        // Create an array of observables for getProductImages
        const imageObservables = productArray.map((product) => this.getProductImages(product.id));
  
        // Use forkJoin to wait for all observables to complete
        return forkJoin(imageObservables).pipe(
          map(() => productArray) // Return the original products after all images are fetched
        );
      })
    );
  }*/

 /* private getProductImages(productId: string): void {
    this.mediaService.getImageByProductId(productId).subscribe({
      next: (result) => {
        for (const key in result) {
          if (result.hasOwnProperty(key)) {
            this.mediaService.getImageByMediaId(result[key]).subscribe({
              next: (image) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const media: Media = {
                    productId: productId,
                    mediaId: result[key],
                    imageData: reader.result,
                  };
                  this.mediaArray.push(media);
                };
                reader.readAsDataURL(image);
              },
              error: (error) => {
                if (this.errorService.isAuthError(error.status)) {
                  this.errorService.handleSessionExpirationError();
                }
              },
            });
          }
        }
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        // Assuming you have a way to get the product instance based on productId
        const product = this.getProductById(productId);

        // Trigger change detection if needed
        // this.changeDetectorRef.detectChanges();
      },
    });
  }*/

  private getProductById(productId: string): void {
   this.allProducts$.subscribe(products => {
      const product = products.find((product) => product.id === productId);
      if (product) {
        product.productMedia = this.mediaArray;
      }
      // Trigger change detection if needed
      // this.changeDetectorRef.detectChanges();
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
