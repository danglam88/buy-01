import { Component, Input, OnInit } from '@angular/core';
import { MediaService } from 'src/app/services/media.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

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
    private toastr: ToastrService,
    private router: Router
  ) { 
      this.toastr.toastrConfig.positionClass = 'toast-bottom-right';
    // Handles deletion of product media. If so, will get product media to display updates
    this.mediaService.productMediaDeleted.subscribe((productMediaDeleted) => {
      if (productMediaDeleted) {
        this.getProductMedia(this.productId);
      }
    });
  }

  ngOnInit(): void {
    this.getProductMedia(this.productId);
  }

  // Gets product media in a timeout to allow for product media to be created before getting it
  getProductMedia(productId: string){
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
              if (error.status == 401 || error.status == 403) {
                this.toastr.error('Session expired. Log-in again.');
                this.router.navigate(['../login']);
              }
            },
          });
        },
        error: (error) => {
          if (error.status == 401 || error.status == 403) {
            this.toastr.error('Session expired. Log-in again.');
            this.router.navigate(['../login']);
          }
        },
      });
    }, 250);
  }
}
