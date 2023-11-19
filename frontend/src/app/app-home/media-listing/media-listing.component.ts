import { Component, Input, OnInit } from '@angular/core';
import { MediaService } from 'src/app/services/media.service';
import { ErrorService } from 'src/app/services/error.service';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-media-listing',
  templateUrl: './media-listing.component.html',
  styleUrls: ['./media-listing.component.css']
})
export class MediaListingComponent implements OnInit {
  mediaImageData: any;
  @Input() productId: string;

  constructor(
    private mediaService: MediaService, 
    private errorService: ErrorService,
  ) { }

  ngOnInit(): void {
   this.mediaService.productMediaDeleted$.subscribe(()=> this.getProductMedia(this.productId));
   this.getProductMedia(this.productId);
  }  

 getProductMedia(productId: string): void {
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
