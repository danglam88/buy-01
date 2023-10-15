import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.css']
})
export class MediaComponent {
  @Input() mediaImageData: any;
  //@Input()  productImages: any = {};

  // currentIndex = 0;
  

  // get currentImage(): string {
  //   return this.productImages[this.currentIndex];
  // }

  // previousSlide() {
  //   const objectLength = Object.keys(this.productImages).length;
  //   console.log("object length: " + objectLength)
  //   this.currentIndex = (this.currentIndex - 1 + objectLength) % objectLength;
  // }

  // nextSlide() {
  //   const objectLength = Object.keys(this.productImages).length;
  //   console.log("object length: " + objectLength)
  //   this.currentIndex = (this.currentIndex + 1) % objectLength;
  // }
}
