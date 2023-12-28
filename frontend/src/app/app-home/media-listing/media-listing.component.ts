import { Component, Input, OnInit } from '@angular/core';
import { Observable, catchError, of, switchMap } from 'rxjs';

import { MediaService } from 'src/app/services/media.service';
import { ErrorService } from 'src/app/services/error.service';
import { Product } from 'src/app/Models/Product';

@Component({
  selector: 'app-media-listing',
  templateUrl: './media-listing.component.html',
  styleUrls: ['./media-listing.component.css']
})
export class MediaListingComponent implements OnInit {
  mediaImageData: any;
  @Input() product: Product;
  mediaImageData$: Observable<string | ArrayBuffer | null>;

  constructor(
    private mediaService: MediaService, 
    private errorService: ErrorService,
  ) { }

  ngOnInit(): void {
    // Get all product images
    this.getProductImages(this.product.id);

    // Subscribe to check if there is any media upload 
    this.mediaService.mediaUpload.subscribe((mediaCreated) => {
      if (mediaCreated) {
        this.getProductImages(this.product.id);
      }
    });

    // Subscribe to check if there is any media delete
    this.mediaService.mediaDeleted.subscribe((mediaDeleted) => {
      if (mediaDeleted) {
        this.getProductImages(this.product.id);
      }
    });
  }  
  
  // Get all product images
  getProductImages(productId: string): void {
    this.mediaImageData$ = this.mediaService.getImageByProductId(productId).pipe(
      switchMap((result) => {
        if (result && typeof result === 'object' && Object.keys(result).length > 0) {
          return this.mediaService.getImageByMediaId(result[0]).pipe(
            switchMap((mediaResult) => {
              return new Observable<string | ArrayBuffer>((observer) => {
                const reader = new FileReader();
                reader.onload = () => {
                  observer.next(reader.result);
                  observer.complete();
                };
                reader.onerror = () => {
                  observer.error('Error reading image data');
                };
                reader.readAsDataURL(mediaResult);
              });
            }),
            catchError((error) => {
              if (this.errorService.isAuthError(error.status)) {
                this.errorService.handleSessionExpirationError();
              }
              return of(null);
            })
          );
        } else {
          console.log('No media found for product');
          return of(null);
        }
      }),
      catchError((error) => {
        if (this.errorService.isAuthError(error.status)) {
          this.errorService.handleSessionExpirationError();
        }
        return of(null);
      })
    );
  } 
}
