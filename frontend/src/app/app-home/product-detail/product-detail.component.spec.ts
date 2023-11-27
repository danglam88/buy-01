import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'; 
import { of, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DebugElement } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { By } from '@angular/platform-browser';

import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductDetailComponent } from './product-detail.component';
import {  MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

import { ProductService } from 'src/app/services/product.service';
import { MediaService } from 'src/app/services/media.service';
import { EncryptionService } from 'src/app/services/encryption.service';
import { ValidationService } from 'src/app/services/validation.service';
import { ErrorService } from 'src/app/services/error.service';


class ToastrServiceStub {
  error(message: string) {}
  success(message: string) {}
}

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let productService: ProductService;
  let mediaService: jasmine.SpyObj<MediaService>;
  let encryptionService: EncryptionService;
  let errorService: ErrorService;
  let router: Router;
  let matDialog: MatDialog;
  let toastrService: ToastrService;
  let anchorElement: DebugElement;

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
   
   
    matDialog = jasmine.createSpyObj('MatDialog', ['open']);
       
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
        ReactiveFormsModule
      ]
    });
    
    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    component.productImages = ["data:image/jpeg;base64,/1", "data:image/jpeg;base64,/2"];
    matDialog = TestBed.inject(MatDialog);
    productService = TestBed.inject(ProductService);
    mediaService = TestBed.inject(MediaService) as jasmine.SpyObj<MediaService>;
    router = TestBed.inject(Router);
    toastrService = TestBed.inject(ToastrService);
    errorService = TestBed.inject(ErrorService);
    encryptionService = TestBed.inject(EncryptionService);
   // fixture.detectChanges();
   
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

  /*it('should navigate to login when the secret is invalid', () => {
    spyOn(encryptionService, 'decrypt').and.throwError('Invalid decryption');
    spyOn(router, 'navigate'); 
    const token = productService.token;
  
    expect(token).toBe('');
    expect(router.navigate).toHaveBeenCalledWith(['../login']);
  });*/

  /*it('should call getMediaArray() and retrieve product images', fakeAsync(() => {
    const mockProductId = "123";
    const mockProducMediaIDs = ['1', '2'];
    const mockProductMediaData = new Blob([''], { type: 'image/jpeg' });
    const mockProductImageResult = [mockProductMediaData, mockProductMediaData];
    component.getMediaArray(mockProductId);
    mediaService.getImageByProductId.and.returnValue(of(mockProducMediaIDs));
    mediaService.getImageByMediaId.and.returnValue(of(mockProductImageResult[0]));
    component.getMediaArray(mockProductId);
  
    tick();
  
    expect(component.getMediaArray).toHaveBeenCalledWith(mockProductId);
    expect(mediaService.getImageByProductId).toHaveBeenCalledWith(mockProductId);
    expect(mediaService.getImageByMediaId).toHaveBeenCalledWith(mockProductImageResult[0]);
    component.mediaArray$.subscribe((data) => {
      expect(data).toBeTruthy();
    });
  }));*/
  
  /*it('should update name', () => {
    const fieldName = 'name';
    spyOn(component, 'updateField').and.callThrough();
    spyOn(productService, 'updateProduct');
    component.updateField(fieldName);
  
    expect(component.updateField).toHaveBeenCalledWith(fieldName);
    expect(productService.updateProduct).toHaveBeenCalledWith(component.product);
    expect(component.editingField).toBeNull();
  });*/

  /*it('delete image when user confirmed', fakeAsync(() => {
    const mockCurrentImage = { mediaId: '123' }; 
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of(true)); 

    spyOn(matDialog, 'open').and.returnValue(dialogRef);   

    component.deleteImage(mockCurrentImage);

    tick();

    expect(matDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      data: { confirmationText: 'Delete this image?' },
    });
    expect(mediaService.deleteMedia).toHaveBeenCalledWith(mockCurrentImage.mediaId);
    expect(component.getProductImages).toHaveBeenCalled();
  }));*/

  /*it('should save the selected files when the image limit is not exceeded', () => {
    const maxImageLimit = 5;
    component.noOfImages = maxImageLimit - 2; 
    const selectedFiles = [{ 
      file: new File([], 'image1.jpg'),
      url: 'image1.jpg',
     }];
    spyOn(component, 'saveEachSelectedFile');
     
    spyOn(component, 'saveEditedImages').and.callThrough();
    component.selectedFiles = selectedFiles;
    component.saveEditedImages();

    expect(component.saveEachSelectedFile).toHaveBeenCalledWith(component.product.id, 0);
  });*/

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

  /*it('should save each selected file', fakeAsync(() => {
    const productId = '1';
    const index = 0;
  
    const selectedFiles = [{
      file: new File([], 'image1.jpg'),
      url: 'image1.jpg',
    }];
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('file', selectedFiles[index].file);
  
    component.selectedFiles = selectedFiles;
    component.saveEachSelectedFile(productId, index);

    tick();
  
    expect(mediaService.uploadMedia).toHaveBeenCalledWith(formData);
    expect(component.getProductImages).toHaveBeenCalled();
  }));*/

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
