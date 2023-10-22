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
    this.mediaService.getImageByProductId(this.productId).subscribe({
      next: (result) => {
        console.log("result" + result)
        console.log("Hello")
          this.mediaService.getImageByMediaId(result["0"]).subscribe({
            next: (mediaResult) => {
              console.log("mediaResult" + mediaResult)
            const reader = new FileReader();
            reader.onload = () => {
              this.mediaImageData = reader.result; 
            };
            reader.readAsDataURL(mediaResult); 
            },
            error: (error) => {
              console.error(error);
            },
            complete: () => {
              //console.log('Media retrieved');
            }
          });
      },
      error: (error) => {
        console.error(error);
        if (error.status == 404) {
          console.log('Media not found');
        }
      },
      complete: () => {
       // console.log('All media retrieved');
      }
    });
  }
}
