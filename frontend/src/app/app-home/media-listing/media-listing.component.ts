import { Component, Input, OnInit, ChangeDetectorRef  } from '@angular/core';
import { MediaService } from 'src/app/services/media.service';
import { ErrorService } from 'src/app/services/error.service';
import { Product } from 'src/app/Models/Product';
import { Media } from 'src/app/Models/Media';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-media-listing',
  templateUrl: './media-listing.component.html',
  styleUrls: ['./media-listing.component.css']
})
export class MediaListingComponent implements OnInit {
  mediaImageData: any;
  @Input() product: Product;
  mediaArray$: Observable<Media[]>;

  constructor(
    private mediaService: MediaService, 
    private errorService: ErrorService,
  ) { }

  ngOnInit(): void {
    this.getProductImages(this.product.id);
    this.mediaArray$.subscribe((media) => {
      this.mediaImageData = media[0].imageData;
      this.product.productMedia = media;
    });
  }  

  getProductImages(productId: string): void {
    this.mediaArray$ = this.mediaService
      .getImageByProductId(productId)
      .pipe(
        switchMap((result) => {
          const mediaObservables = Object.keys(result).map((key) =>
            this.mediaService.getImageByMediaId(result[key]).pipe(
              switchMap((image) => {
                return new Observable<Media>((observer) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const media: Media = {
                      productId: productId,
                      mediaId: result[key],
                      imageData: reader.result,
                    };
                    observer.next(media);
                    observer.complete();
                  };
                  reader.readAsDataURL(image);
                });
              }),
              catchError((error) => {
                if (this.errorService.isAuthError(error.status)) {
                  this.errorService.handleSessionExpirationError();
                }
                return of(null);
              })
            )
          );
          return forkJoin(mediaObservables);
        })
      );
  }

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
