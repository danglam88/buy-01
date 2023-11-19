import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CreateProductComponent } from './create-product.component';
import { ImageSliderComponent } from '../image-slider/image-slider.component';
import { ProductService } from 'src/app/services/product.service';
import { ErrorService } from 'src/app/services/error.service';
import { ValidationService } from 'src/app/services/validation.service';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of  } from 'rxjs';

describe('CreateProductComponent', () => {
  let component: CreateProductComponent;
  let fixture: ComponentFixture<CreateProductComponent>;
  let productService: jasmine.SpyObj<ProductService>;;
  let toastrService: ToastrService;

  // Create a mock MatDialogRef
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  beforeEach(() => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['createProduct']);
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
        ValidationService,
        ToastrService,
        ErrorService,
        { provide: MatDialogRef, useValue: mockDialogRef }, 
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ProductService, useValue: productServiceSpy },
      ],
    });
    fixture = TestBed.createComponent(CreateProductComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    toastrService = TestBed.inject(ToastrService);
    spyOn(toastrService, 'error'); 
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create product form', () => {
    expect(component.createProductForm).toBeTruthy();
  });

/*  it('should call createProduct and handle success', fakeAsync(() => {
    // Arrange

    productService.createProduct.and.returnValue(of({ success: true }));
    component.createProductForm.controls.name.setValue('Valid Name');
    component.createProductForm.controls.price.setValue('10.00');
    component.createProductForm.controls.quantity.setValue('10');
    component.createProductForm.controls.description.setValue('Valid description');
    component.selectedFiles.push({
      file: new File([], 'image.jpg'),
      url: 'test-url',
    });

    // Act
    component.createProduct();
    tick();

    // Assert
    expect(productService.createProduct).toHaveBeenCalled();
    expect(toastrService.success).toHaveBeenCalledWith('Product created successfully.');
    expect(component.closeModal).toHaveBeenCalled(); 
  }));*/


  it('should show error message when name in form is invalid', fakeAsync(() => {
    component.createProductForm.controls.name.setValue('');
   
    component.createProduct();
  
    tick();
  
    expect(productService.createProduct).not.toHaveBeenCalled();
    expect(toastrService.error).toHaveBeenCalledWith('Name must be between 1 and 50 characters.');
  }));

  it('should show error message when there are no image file to upload', fakeAsync(() => {
    component.selectedFiles.length = 0;
      
    component.createProductForm.controls.name.setValue('Valid Name');
    component.createProductForm.controls.quantity.setValue('10');
    component.createProductForm.controls.price.setValue('10');
    component.createProductForm.controls.description.setValue('Valid Description');

    component.createProduct();
  
    tick();
  
    expect(productService.createProduct).not.toHaveBeenCalled();
    expect(toastrService.error).toHaveBeenCalledWith('Please upload at least one image.'); 
  }));

  it('should call fileInput() click event when "Upload Image" button is clicked', () => {
    const fileInput = fixture.nativeElement.querySelector('input[type="file"]'); 
  
    const button = fixture.nativeElement.querySelector('.upload-button');
    spyOn(fileInput, 'click');
  
    button.click();
  
    expect(fileInput.click).toHaveBeenCalled();
  });  
  
  it('should remove selected image when calling onImageRemoved', () => {
    const file = new File([''], 'image.jpg', { type: 'image/jpeg' });
    component.selectedFiles.push({ file, url: 'test-url' });
    component.onImageRemoved(0);
    expect(component.selectedFiles.length).toBe(0);
  });

  it('should add a selected file when calling onFileSelected() with a valid image', () => {
    const file = new File([''], 'image.jpg', { type: 'image/jpeg' });
    const event = {
      target: { files: [file] }
    };
    component.onFileSelected(event);
    expect(component.selectedFiles.length).toBe(1);
  });

  it('should show app-image-slider when selectedFiles has items', () => {
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
