import { Component, Input, OnInit, ChangeDetectorRef  } from '@angular/core';
import { MediaService } from 'src/app/services/media.service';
import { ErrorService } from 'src/app/services/error.service';
import { Product } from 'src/app/Models/Product';
import { Media } from 'src/app/Models/Media';

@Component({
  selector: 'app-media-listing',
  templateUrl: './media-listing.component.html',
  styleUrls: ['./media-listing.component.css']
})
export class MediaListingComponent implements OnInit {
  mediaImageData: any;
  @Input() product: Product;
  mediaArray: any[] = [];

  constructor(
    private mediaService: MediaService, 
    private errorService: ErrorService,
  ) { }

  ngOnInit(): void {
    console.log("product in media listing", this.product);
   //this.mediaService.productMediaDeleted$.subscribe(()=> this.getProductMedia(this.product.id));
  // this.getProductImages(this.product.id);

  }  

 /*getProductMedia(productId: string): void {
    this.mediaService.getImageByProductId(productId).pipe(
      switchMap((result) => {
        if (result) {
          const mediaId = result[0]; 
          return this.mediaService.getImageByMediaId(mediaId);
        } else {
          // No media ID found, return an empty observable
          return of(null);
        }
      }),
      catchError((error) => {
        if (this.errorService.isAuthError(error.status)) {
          this.errorService.handleSessionExpirationError();
        }
        return of(null);
      })
    ).subscribe({
      next: (mediaResult) => {
        if (mediaResult) {
          const reader = new FileReader();
          reader.onload = () => {
            this.mediaImageData = reader.result;
          };
          reader.readAsDataURL(mediaResult);
        }
      },
      error: (error) => {
        console.error('Error fetching media data:', error);
      }
    });
  }*/

/* getProductImages(productId: string) {
  let mediaImageDataSet = false; 
    this.mediaService.getImageByProductId(productId).subscribe({
      next: (result) => {
        for (const key in result) {
          if (result.hasOwnProperty(key)) {
            this.mediaService.getImageByMediaId(result[key]).subscribe({
              next: (image) => {
                const reader = new FileReader();
                reader.onload = () => {
                  if (!mediaImageDataSet) {
                    this.mediaImageData = reader.result;
                    mediaImageDataSet = true; // Set the flag to true
                  }
                 const media: Media = {
                    productId: productId, // Assuming you have an ID for media, replace with the actual ID
                    mediaId: result[key],
                    imageData: reader.result,
                  };

                  //Get product instance based on productId

                this.mediaArray.push(media);
                  // Add media to productMedia array
                  //this.product.productMedia.push(this.media);
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
        this.product.productMedia = this.mediaArray;

      // Trigger change detection
     // this.changeDetectorRef.detectChanges();
      }
    });
  }*/
  

  // Gets product media in a timeout to allow for product media to be created before getting it
  /*getProductMedia(productId: string){
    setTimeout(() => {
      this.mediaService.getImageByProductId(productId).subscribe({
        next: (result) => {
          this.mediaService.getImageByMediaId(result[0]).subscribe({
            next: (mediaResult) => {
            const reader = new FileReader();
            reader.onload = () => {
              this.mediaImageData = reader.result; 
            };
            reader.readAsDataURL(mediaResult); 
            },
            error: (error) => {
              if (this.errorService.isAuthError(error.status)) {
                this.errorService.handleSessionExpirationError();
              }
            },
          });
        },
        error: (error) => {
          if (this.errorService.isAuthError(error.status)) {
            this.errorService.handleSessionExpirationError();
          }
        },
      });
    }, 250);
  }*/
}
