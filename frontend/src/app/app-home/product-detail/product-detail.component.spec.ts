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
  
  beforeEach(() => { 
    const spy = jasmine.createSpyObj('MediaService', ['getImageByProductId', 'getImageByMediaId']); 
    let mockProductDetails = {
      name: 'Mock Product',
      description: 'Mock Product Description',
      price: 100,
      quantity: 10,
    };
    const encryptedSecret = 'str';
    const decryptedSecret = JSON.stringify({ role: 'SELLER' });
   
    matDialog = jasmine.createSpyObj('MatDialog', ['open']);
       
    TestBed.configureTestingModule({
      declarations: [ProductDetailComponent, ConfirmationDialogComponent],
      providers: [
        ProductService,
        EncryptionService,
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
    fixture.detectChanges();
    spyOn(sessionStorage, 'getItem').and.returnValue(encryptedSecret);
    spyOn(encryptionService, 'decrypt').and.returnValue(decryptedSecret);
    spyOn(router, 'navigate'); 
    spyOn(component, 'ngOnInit').and.callThrough();
    spyOn(component, 'getProductImages').and.callThrough();
    spyOn(component, 'getMediaArray').and.callThrough();
    spyOn(mediaService, 'getImageByMediaId').and.returnValue(of(new Blob()));
    spyOn(component, 'updateField').and.callThrough();
    spyOn(component, 'deleteImage').and.callThrough();
    spyOn(component, 'deleteProduct').and.callThrough();
    spyOn(component, 'saveEditedImages').and.callThrough();
    spyOn(component, 'saveEachSelectedFile').and.callThrough();
    expect(productService.updateProduct).toHaveBeenCalledWith(mockProductDetails);
    spyOn(productService, 'updateProduct').and.returnValue(of({ success: true }));
    spyOn(component, 'updateField').and.callThrough();
    spyOn(mediaService, 'deleteMedia').and.returnValue(of({ success: true }));
    spyOn(productService, 'deleteProduct').and.returnValue(of({ success: true }));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpirationError');
  });

  beforeEach(() => {
    anchorElement = fixture.debugElement.query(By.css('.remove-image')); 
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the user role', () => {   
    sessionStorage.getItem('srt');
    expect( component.userRole).toEqual('SELLER');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should return an empty string when no encrypted secret is stored', () => {
      spyOn(sessionStorage, 'getItem').and.returnValue(null); 
      const userRole = component.userRole;
      expect(userRole).toEqual('');
  });

  it('should navigate to login when the secret is invalid', () => {
    spyOn(encryptionService, 'decrypt').and.throwError('Invalid decryption');
    const token = productService.token;
  
    expect(token).toBe('');
    expect(router.navigate).toHaveBeenCalledWith(['../login']);
  });
  
  it('should create product form', () => {
    expect(component.productDetailForm).toBeTruthy();
  });

  it('should call getMediaArray() and retrieve product images', fakeAsync(() => {
    const mockProductId = "123";
    const mockProducMediaIDs = ['1', '2'];
    const mockProductMediaData = new Blob([''], { type: 'image/jpeg' });
    const mockProductImageResult = [mockProductMediaData, mockProductMediaData];

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
  }));
  
  it('should update name', () => {
    const fieldName = 'name';
    const fieldValue = 'New Product Name';

    component.productDetailForm.controls[fieldName].setValue(fieldValue);
    component.updateField(fieldName);
  
    expect(component.updateField).toHaveBeenCalledWith(fieldName);
    expect(productService.updateProduct).toHaveBeenCalledWith(component.product);
    expect(component.editingField).toBeNull();
  });

  it('should handle error with status 403 updateField()', fakeAsync(() => {
    const fieldName = 'name';
    const fieldValue = 'New Product Name';
  
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };

    component.productDetailForm.controls[fieldName].setValue(fieldValue);
  
    spyOn(productService, 'updateProduct').and.returnValue(new Observable((observer) => {
      observer.error(errorResponse);
      observer.complete();
    }));
  ;
    component.updateField(fieldName);
    tick();

    expect(component.updateField).toHaveBeenCalled();
    expect(productService.updateProduct).not.toHaveBeenCalled();
    expect(errorService.isAuthError).toHaveBeenCalledWith(403);
    expect(errorService.handleSessionExpirationError).toHaveBeenCalled();
  }));

  it('delete image when user confirmed', fakeAsync(() => {
    const mockCurrentImage = { mediaId: '123' }; 
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of(true)); 

    spyOn(matDialog, 'open').and.returnValue(dialogRef);   
    spyOn(mediaService.mediaDeleted, 'emit');

    component.deleteImage(mockCurrentImage);

    tick();

    expect(matDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      data: { confirmationText: 'Delete this image?' },
    });
    expect(mediaService.deleteMedia).toHaveBeenCalledWith(mockCurrentImage.mediaId);
    expect(component.getProductImages).toHaveBeenCalled();
    expect(mediaService.mediaDeleted.emit).toHaveBeenCalledWith(true);
  }));

  it('should not delete image when user does not confirmed', fakeAsync(() => {
    const mockCurrentImage = { mediaId: '123' }; 
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of(false)); 

    spyOn(mediaService.mediaDeleted, 'emit');

    component.deleteImage(mockCurrentImage);

    tick();

    expect(matDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      data: { confirmationText: 'Delete this image?' },
    });
    expect(mediaService.deleteMedia).not.toHaveBeenCalledWith(mockCurrentImage.mediaId);
    expect(component.getProductImages).not.toHaveBeenCalled();
    expect(mediaService.mediaDeleted.emit).not.toHaveBeenCalled();
  }));

  it('should handle error with status 403 for deleteImage()', fakeAsync(() => {
    const mockCurrentImage = { mediaId: '123' }; 
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of(true)); 
    
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };
    spyOn(matDialog, 'open').and.returnValue(dialogRef);  
    spyOn(mediaService, 'deleteMedia').and.returnValue(new Observable((observer) => {
      observer.error(errorResponse);
      observer.complete();
    }));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpirationError');

    component.deleteImage(mockCurrentImage);
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      data: { confirmationText: 'Delete this image?' },
    });
    expect(component.deleteImage).toHaveBeenCalledWith(mockCurrentImage);
    expect(mediaService.deleteMedia).not.toHaveBeenCalledWith(mockCurrentImage.mediaId);
    expect(errorService.isAuthError).toHaveBeenCalledWith(403);
    expect(errorService.handleSessionExpirationError).toHaveBeenCalled();
  }));

  it('should delete product when confirmed', fakeAsync(() => {
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of(true)); 

    spyOn(matDialog, 'open').and.returnValue(dialogRef); 

    
    spyOn(productService.productDeleted, 'emit');

    component.deleteProduct();

    tick();

    expect(matDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      data: { confirmationText: 'Delete this product?' },
    });
    expect(productService.deleteProduct).toHaveBeenCalled();
    expect(productService.productDeleted.emit).toHaveBeenCalledWith(true);
  }));

  it('should not delete product when user does not confirmed', fakeAsync(() => {
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of(false)); 

    spyOn(matDialog, 'open').and.returnValue(dialogRef); 
    spyOn(productService, 'deleteProduct');
    spyOn(productService.productDeleted, 'emit');

    component.deleteProduct();

    tick();

    expect(matDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      data: { confirmationText: 'Delete this product?' },
    });
    expect(productService.deleteProduct).not.toHaveBeenCalled();
    expect(productService.productDeleted.emit).not.toHaveBeenCalledWith(true);
  }));

  it('should handle error with status 403 for deleteProduct', fakeAsync(() => {
    spyOn(component, 'deleteProduct').and.callThrough();
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of(true)); 

    spyOn(matDialog, 'open').and.returnValue(dialogRef);
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };

    spyOn(productService, 'deleteProduct').and.returnValue(new Observable((observer) => {
      observer.error(errorResponse);
      observer.complete();
    }));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpirationError');


    component.deleteProduct();
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      data: { confirmationText: 'Delete this product?' },
    });
    expect(productService.deleteProduct).toHaveBeenCalled();
    expect(errorService.isAuthError).toHaveBeenCalledWith(403);
    expect(errorService.handleSessionExpirationError).toHaveBeenCalled();
  }));

  it('should save the selected files when the image limit is not exceeded', () => {
    const maxImageLimit = 5;
    component.noOfImages = maxImageLimit - 2; 
    const selectedFiles = [{ 
      file: new File([], 'image1.jpg'),
      url: 'image1.jpg',
     }];
    spyOn(component, 'saveEachSelectedFile');
    spyOn(mediaService.mediaUpload, 'emit');

    component.selectedFiles = selectedFiles;
    component.saveEditedImages();

    expect(component.saveEachSelectedFile).toHaveBeenCalledWith(component.product.id, 0);
    expect(mediaService.mediaUpload.emit).toHaveBeenCalledWith(true);
  });

  it('shoud not save the selected files when the image limit is exceeded', () => {
    const maxImageLimit = 5;
    component.noOfImages = maxImageLimit + 2; 
    const selectedFiles = [{ 
      file: new File([], 'image1.jpg'),
      url: 'image1.jpg',
     }];
    spyOn(component, 'saveEachSelectedFile');
    spyOn(mediaService.mediaDeleted, 'emit');
    spyOn(toastrService, 'error');

    component.selectedFiles = selectedFiles;
    component.saveEditedImages();

    expect(component.saveEachSelectedFile).not.toHaveBeenCalled();
    expect(mediaService.mediaDeleted.emit).not.toHaveBeenCalled();
    expect(toastrService.error).toHaveBeenCalledWith('Image Limit Exceeded: You can only add a maximum of 5 images');
  });

  it('should save each selected file', fakeAsync(() => {
    const productId = '1';
    const index = 0;
  
    const selectedFiles = [{
      file: new File([], 'image1.jpg'),
      url: 'image1.jpg',
    }];
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('file', selectedFiles[index].file);
  
    spyOn(mediaService, 'uploadMedia').and.returnValue(of({ success: true }));
    spyOn(component, 'getProductImages').and.callThrough();
  
    component.selectedFiles = selectedFiles;
    component.saveEachSelectedFile(productId, index);

    tick();
  
    expect(mediaService.uploadMedia).toHaveBeenCalledWith(formData);
    expect(component.getProductImages).toHaveBeenCalled();
  }));

  it('should handle error with status 403 for saveEachSelectedFile()', fakeAsync(() => {
    spyOn(component, 'saveEachSelectedFile').and.callThrough();
    const productId = '1';
    const index = 0;
  
    const selectedFiles = [{
      file: new File([], 'image1.jpg'),
      url: 'image1.jpg',
    }];
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('file', selectedFiles[index].file);

    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };

    spyOn(mediaService, 'uploadMedia').and.returnValue(new Observable((observer) => {
      observer.error(errorResponse);
      observer.complete();
    }));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpirationError');

    component.selectedFiles = selectedFiles;
    component.saveEachSelectedFile(productId, index);
    tick();

    expect(component.saveEachSelectedFile).toHaveBeenCalled();
    expect(mediaService.uploadMedia).toHaveBeenCalled();
    expect(errorService.isAuthError).toHaveBeenCalledWith(403);
    expect(errorService.handleSessionExpirationError).toHaveBeenCalled();
  }));

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

  it('should show the remove-image anchor when conditions are met', () => {
    component.editingField = 'deleteImages';
    const anchorElement = spyOn(sessionStorage, 'getItem').and.returnValue('{"role": "SELLER"}');
    component.product.editable = true;
    component.noOfImages = 2;

    fixture.detectChanges();

    expect(anchorElement).toBeTruthy();
  });

  it('should hide the remove-image anchor when conditions are not met', () => {
    component.editingField = 'otherField';
    spyOn(sessionStorage, 'getItem').and.returnValue('{"role": "SELLER"}');
    component.product.editable = false;
    component.noOfImages = 0;

    fixture.detectChanges();

    expect(anchorElement).toBeNull();
  });
});
