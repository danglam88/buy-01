import { Component, Input, OnInit } from '@angular/core';
import { MediaService } from 'src/app/services/media.service';

@Component({
  selector: 'app-media-listing',
  templateUrl: './media-listing.component.html',
  styleUrls: ['./media-listing.component.css']
})
export class MediaListingComponent implements OnInit {
  mediaImageData: any;
  @Input() productId: string;

  constructor(private mediaService: MediaService) { }

  ngOnInit(): void {
    if (this.productId) {
      this.mediaService.getImageByProductId(this.productId).subscribe({
        next: (result) => {
          this.mediaService.getImageByMediaId(result["0"]).subscribe({
            next: (mediaResult) => {
            const reader = new FileReader();
            reader.onload = () => {
              this.mediaImageData = reader.result; 
            };
            reader.readAsDataURL(mediaResult); 
            },
            error: (error) => {
              console.error(error);
            },
          });
        },
        error: (error) => {
          console.error(error);
          if (error.status == 404) {
            console.log('Media not found');
          }
        },
      });
    }
  }
}
