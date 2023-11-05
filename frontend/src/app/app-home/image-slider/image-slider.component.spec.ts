import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageSliderComponent } from './image-slider.component';
import { AngularMaterialModule } from 'src/app/angular-material.module';

describe('ImageSliderComponent', () => {
  let component: ImageSliderComponent;
  let fixture: ComponentFixture<ImageSliderComponent>;

  const selectedFiles = [
    { file: new File([], 'image1.jpg'), url: 'image1.jpg' },
    { file: new File([], 'image2.jpg'), url: 'image2.jpg' },
    { file: new File([], 'image3.jpg'), url: 'image3.jpg' },
  ];

  beforeEach(async () => { // Use async to allow for component compilation
    TestBed.configureTestingModule({
      declarations: [ImageSliderComponent],
      imports: [AngularMaterialModule],
    });

    fixture = TestBed.createComponent(ImageSliderComponent);
    component = fixture.componentInstance;
    component.images = selectedFiles;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize currentIndex to 0', () => {
    expect(component.currentIndex).toEqual(0);
  });

  it('should update currentIndex when moving to the previous slide', () => {
    component.currentIndex = 2;
    component.previousSlide();
    expect(component.currentIndex).toEqual(1);
  });

  it('should update currentIndex when moving to the next slide', () => {
    component.currentIndex = 2;
    component.nextSlide();
    expect(component.currentIndex).toEqual(0);
  });

  it('should remove the image and update currentIndex when calling removeImage', () => {
    const initialLength = component.images.length;
    const indexToRemove = 1;
    component.currentIndex = indexToRemove; 
    const emitSpy = spyOn(component.imageRemoved, 'emit');
    component.removeImage(indexToRemove);
  
    expect(component.images.length).toEqual(initialLength );
    expect(component.currentIndex).toEqual(0); 
    expect(emitSpy).toHaveBeenCalledWith(indexToRemove);
  });  
});
