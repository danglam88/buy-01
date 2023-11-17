import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CreateProductComponent } from './create-product.component';
import { ImageSliderComponent } from '../image-slider/image-slider.component';
import { ProductService } from 'src/app/services/product.service';
import { ValidationService } from 'src/app/services/validation.service';
import { ErrorService } from 'src/app/services/error.service';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, Observable  } from 'rxjs';

class ToastrServiceStub {
  error(message: string) {
    // Do nothing in the stub
  }
  success(message: string) {
    // Do nothing in the stub
  }
}

describe('CreateProductComponent', () => {
  let component: CreateProductComponent;
  let fixture: ComponentFixture<CreateProductComponent>;
  let productService: ProductService;
  let toastrService: ToastrService;
  let errorService: ErrorService;

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
        ValidationService,
        ErrorService,
        { provide: ToastrService, useClass: ToastrServiceStub },
        { provide: MatDialogRef, useValue: mockDialogRef }, 
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
    });
    fixture = TestBed.createComponent(CreateProductComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService);
    toastrService = TestBed.inject(ToastrService);
    errorService = TestBed.inject(ErrorService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create product form', () => {
    expect(component.createProductForm).toBeTruthy();
  });

  it('should call createProduct() "Create Product" when form is valid and there is at least 1 selectedFile', fakeAsync(() => {
    spyOn(component, 'createProduct').and.callThrough();
    spyOn(productService, 'createProduct').and.returnValue(of({ success: true })); 
     
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

  it('should handle error 403 for createProduct()', fakeAsync(() => {
    spyOn(component, 'createProduct').and.callThrough();
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };

    spyOn(productService, 'createProduct').and.returnValue(new Observable((observer) => {
      observer.error(errorResponse);
      observer.complete();
    }));
    
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpirationError');

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
    expect(errorService.isAuthError).toHaveBeenCalledWith(403);
    expect(errorService.handleSessionExpirationError).toHaveBeenCalled();
  }));

  it('should show error message when name in form is invalid', fakeAsync(() => {
    spyOn(component, 'createProduct').and.callThrough();
    spyOn(productService, 'createProduct').and.returnValue(of({ success: true })); 
    spyOn(toastrService, 'error');
   
    component.createProduct();
  
    tick();
  
    expect(component.createProduct).toHaveBeenCalled(); 
    expect(component.createProductForm.controls.name.invalid).toBeTrue();
    expect(productService.createProduct).not.toHaveBeenCalled(); 
    expect(toastrService.error).toHaveBeenCalledWith('Name must be between 1 and 50 characters.'); 
  }));

  it('should show error message when there are no image file to upload', fakeAsync(() => {
    component.selectedFiles.length = 0;
    spyOn(component, 'createProduct').and.callThrough();
    spyOn(productService, 'createProduct').and.returnValue(of({ success: true })); 
    spyOn(toastrService, 'error');
   
    component.createProductForm.controls.name.setValue('Valid Name');
    component.createProductForm.controls.quantity.setValue('10');
    component.createProductForm.controls.price.setValue('10');
    component.createProductForm.controls.description.setValue('Valid Description');

    component.createProduct();
  
    tick();
  
    expect(component.createProduct).toHaveBeenCalled(); 
    expect(component.selectedFiles.length).toBe(0);
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
