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

  // Getter method to get current image
  get currentImage(): string {
    if (this.images.length > 0) {
      return this.images[this.currentIndex].url;
    }
    return '';
  }

  // Go to previous slide
  previousSlide() {
    if (this.images.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    }
  }

  // Go to previous slide
  nextSlide() {
    if (this.images.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }
  }
  
  // Remove image
  removeImage(index: number) {
    if (this.images.length > 0) {
      this.imageRemoved.emit(index);
    }
    if (this.currentIndex === index) {
      this.currentIndex = 0;
    } else if (this.currentIndex > index) {
      this.currentIndex--;
    }
  }
}