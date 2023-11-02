import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CreateProductComponent } from './create-product.component';
import { ImageSliderComponent } from '../image-slider/image-slider.component';
import { ProductService } from 'src/app/services/product.service';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';

describe('CreateProductComponent', () => {
  let component: CreateProductComponent;
  let fixture: ComponentFixture<CreateProductComponent>;
  let productService: ProductService;
  let toastrService: ToastrService;

  // Create a mock MatDialogRef
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateProductComponent, ImageSliderComponent],
      imports: [
        ToastrModule.forRoot(), 
        AngularMaterialModule,
        FormsModule, 
        ReactiveFormsModule, 
        HttpClientTestingModule,
        MatDialogModule,
        NoopAnimationsModule,
      ],
      providers: [
        ProductService,
        { provide: ToastrService, useValue: { error: () => {}, success: () => {} } },
        { provide: MatDialogRef, useValue: mockDialogRef }, // Provide the mock MatDialogRef
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
    });
    fixture = TestBed.createComponent(CreateProductComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger createProduct method when "Create Product" button is clicked', fakeAsync(() => {
    spyOn(component, 'createProduct').and.callThrough();
    spyOn(productService, 'createProduct').and.returnValue(of({ success: true })); // Simulate a successful response
     
    component.createProductForm.controls.name.setValue('Valid Name');
    component.createProductForm.controls.price.setValue('10.00');
    component.createProductForm.controls.quantity.setValue('10');
    component.createProductForm.controls.description.setValue('Valid description');
  
    component.selectedFiles.push({
      file: new File([], 'image.jpg'),
      url: 'test-url',
    });
  
    component.createProduct();
    tick();
  
    expect(component.createProduct).toHaveBeenCalled();
    expect(productService.createProduct).toHaveBeenCalled();
  }));

  it('should not trigger createProduct method when "Create Product" button is clicked and form is invalid', () => {
    spyOn(component, 'createProduct').and.callThrough();
    spyOn(productService, 'createProduct').and.returnValue(of({ success: false })); 
  
    component.createProduct();
  
    expect(component.createProduct).toHaveBeenCalled();
    expect(productService.createProduct).not.toHaveBeenCalled();
  });
  
  it('should trigger fileInput click event when the "Upload Image" button is clicked', () => {
    const fileInput = fixture.nativeElement.querySelector('input[type="file"]'); 
  
    const button = fixture.nativeElement.querySelector('.upload-button');
    spyOn(fileInput, 'click');
  
    button.click();
  
    expect(fileInput.click).toHaveBeenCalled();
  });
  
  
  it('isImageFile should return false for invalid file types', () => {
    const txtFile = new File([''], 'text.txt', { type: 'text/plain' });
    const pdfFile = new File([''], 'document.pdf', { type: 'application/pdf' });
  
    expect(component.isImageFile(txtFile)).toBe(false);
    expect(component.isImageFile(pdfFile)).toBe(false);
  });
  
  it('isFileSizeValid should return true for files with valid size', () => {
    // Create a Blob with a size less than 2MB
    const smallBlob = new Blob([''], { type: 'image/jpeg' });
    const smallFile = new File([smallBlob], 'small.jpg');
  
    expect(component.isFileSizeValid(smallFile)).toBe(true);
  });
  
  it('isFileSizeValid should return false for files with size exceeding 2MB', () => {
    // Create a Blob with a size greater than 2MB
    const largeBlob = new Blob([''.repeat(3 * 1024 * 1024)], { type: 'image/jpeg' });
    const largeFile = new File([largeBlob], 'large.jpg');
  
    expect(component.isFileSizeValid(largeFile)).toBe(true);
  });  
  
  it('should remove selected image when calling onImageRemoved', () => {
    const file = new File([''], 'image.jpg', { type: 'image/jpeg' });
    component.selectedFiles.push({ file, url: 'test-url' });
    component.onImageRemoved(0);
    expect(component.selectedFiles.length).toBe(0);
  });

  it('should add a selected file when calling onFileSelected with a valid image', () => {
    const file = new File([''], 'image.jpg', { type: 'image/jpeg' });
    const event = {
      target: { files: [file] }
    };
    component.onFileSelected(event);
    expect(component.selectedFiles.length).toBe(1);
  });

  it('should show app-image-slider when selectedFiles has items', () => {
    // Simulate selected files
    component.selectedFiles = [{ file: new File([''], 'image.jpg'), url: 'test-url' }];
    fixture.detectChanges();

    const imageSlider = fixture.nativeElement.querySelector('app-image-slider');
    const previewImage = fixture.nativeElement.querySelector('.preview-image');

    expect(imageSlider).toBeTruthy();
    expect(previewImage).toBeFalsy();
  });

  it('should show the preview image when selectedFiles is empty and previewUrl is set', () => {
    component.previewUrl = 'preview-image-url';
    fixture.detectChanges();

    const imageSlider = fixture.nativeElement.querySelector('app-image-slider');
    const previewImage = fixture.nativeElement.querySelector('.preview-image');

    expect(imageSlider).toBeFalsy();
    expect(previewImage).toBeTruthy();
    expect(previewImage.getAttribute('src')).toBe('preview-image-url');
  });

  it('should show imgPlaceholder when selectedFiles is empty and previewUrl is null', () => {
    component.selectedFiles = [];
    component.previewUrl = null;
    fixture.detectChanges();

    const imageSlider = fixture.nativeElement.querySelector('app-image-slider');
    const previewImage = fixture.nativeElement.querySelector('.preview-image');

    expect(imageSlider).toBeFalsy();
    expect(previewImage).toBeTruthy();
    expect(previewImage.getAttribute('src')).toContain('uploadPhoto.jpg');
  });

});
