import { Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-image-slider',
  templateUrl: './image-slider.component.html',
  styleUrls: ['./image-slider.component.css'],
})
export class ImageSliderComponent  {
  @Input() images: any;
  @Output() imageRemoved = new EventEmitter<number>(); 

  currentIndex = 0;


  get currentImage(): string {
  
    if (this.images.length > 0) {
      return this.images[this.currentIndex].url;
    }
    // Handle the case when there are no images
    return '';
  }

  previousSlide() {

    if (this.images.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    }
  }

  nextSlide() {
    if (this.images.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }
  }
  
  removeImage(index: number) {
    if (this.images.length > 0) {
      // Emit an event to notify the parent component to remove the image at the currentIndex
      this.imageRemoved.emit(index);
    }
  }
}
