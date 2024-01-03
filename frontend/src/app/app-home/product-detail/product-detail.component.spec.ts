import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastrService, ToastrModule } from 'ngx-toastr';

import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductDetailComponent } from './product-detail.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

import { ProductService } from 'src/app/services/product.service';
import { MediaService } from 'src/app/services/media.service';
import { EncryptionService } from 'src/app/services/encryption.service';
import { ValidationService } from 'src/app/services/validation.service';
import { ErrorService } from 'src/app/services/error.service';

class ToastrServiceStub {
  error(message: string) {
    // Do nothing in the stub
  }
  success(message: string) {
    // Do nothing in the stub
  }
}

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let encryptionService: EncryptionService;
  let errorService: ErrorService;
  let toastrService: ToastrService;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close'),
  };

  const encryptedSecret = 'str';
  const decryptedSecret = JSON.stringify({ role: 'SELLER' });
  
  beforeEach(() => { 
    const spy = jasmine.createSpyObj('MediaService', ['getImageByProductId', 'getImageByMediaId', 'deleteMedia', 'uploadMedia']); 
   
    let mockProductDetails = {
      name: 'Mock Product',
      description: 'Mock Product Description',
      price: 100,
      quantity: 10,
    };
   
    TestBed.configureTestingModule({
      declarations: [ProductDetailComponent, ConfirmationDialogComponent],
      providers: [
        EncryptionService,
        ProductService,
        ErrorService,
        ValidationService,
        { provide: MediaService, useValue: spy },
        { provide: ToastrService, useClass: ToastrServiceStub },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { product: mockProductDetails } }
      ],
      imports: [
        HttpClientTestingModule,
        AngularMaterialModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        ToastrModule.forRoot()
      ]
    });
    
    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    component.productImages = ["data:image/jpeg;base64,/1", "data:image/jpeg;base64,/2"];
    errorService = TestBed.inject(ErrorService);
    encryptionService = TestBed.inject(EncryptionService);
    toastrService = TestBed.inject(ToastrService);
   
    spyOn(component, 'getProductImages').and.callThrough();
    spyOn(component, 'getMediaArray').and.callThrough();
    spyOn(component, 'deleteImage').and.callThrough();
    spyOn(component, 'deleteProduct').and.callThrough();
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpirationError');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the user role', () => {   
    spyOn(sessionStorage, 'getItem').and.returnValue(encryptedSecret);
    spyOn(encryptionService, 'decrypt').and.returnValue(decryptedSecret);
    sessionStorage.getItem('srt');
    expect( component.userRole).toEqual('SELLER');
  });

  it('should return an empty string when no encrypted secret is stored', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue(null); 
      const userRole = component.userRole;
      expect(userRole).toEqual('');
  });

  it('shoud not save the selected files when the image limit is exceeded', () => {
    const maxImageLimit = 5;
    component.noOfImages = maxImageLimit + 2; 
    const selectedFiles = [{ 
      file: new File([], 'image1.jpg'),
      url: 'image1.jpg',
     }];
    spyOn(component, 'saveEachSelectedFile');
    spyOn(component, 'saveEditedImages').and.callThrough();
    spyOn(toastrService, 'error');

    component.selectedFiles = selectedFiles;
    component.saveEditedImages();

    expect(component.saveEachSelectedFile).not.toHaveBeenCalled();
    expect(toastrService.error).toHaveBeenCalledWith('Image Limit Exceeded: You can only add a maximum of 5 images');
  });

  it('should initialize currentIndex to 0', () => {
    expect(component.currentIndexOfImageSlider).toEqual(0);
  });

  it('should update currentIndex when moving to the previous slide', () => {
    component.currentIndexOfImageSlider = 2;
    component.noOfImages = 3;
    component.previousSlide();
    expect(component.currentIndexOfImageSlider).toEqual(1);
  });

  it('should update currentIndex when moving to the next slide', () => {
    component.currentIndexOfImageSlider = 1;
    component.noOfImages = 2;
    component.nextSlide();
    expect(component.currentIndexOfImageSlider).toEqual(0);
  });
});
