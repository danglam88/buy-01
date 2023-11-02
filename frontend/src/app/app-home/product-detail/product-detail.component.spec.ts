import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'; 
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductDetailComponent } from './product-detail.component';
import {  MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

import { ProductService } from 'src/app/services/product.service';
import { MediaService } from 'src/app/services/media.service';
import { EncryptionService } from 'src/app/services/encryption.service';
import { ValidationService } from 'src/app/services/validation.service';
import { ToastrService } from 'ngx-toastr';

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
  let productService: ProductService;
  let mediaService: MediaService;
  let validationService: ValidationService;
  let encryptionService: EncryptionService;
  let router: Router;
  let matDialog: MatDialog;
  let matDialogRef: MatDialogRef<any>;
  let toastrService: ToastrService;
  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close'),
  };
  
  beforeEach(() => { 
    let mockProduct = {
      name: 'Mock Product',
      description: 'Mock Product Description',
      price: 100,
      quantity: 10,
    };

    matDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    matDialog = jasmine.createSpyObj('MatDialog', ['open']);
       

    TestBed.configureTestingModule({
      declarations: [ProductDetailComponent, ConfirmationDialogComponent],
      providers: [
        ProductService,
        EncryptionService,
        MediaService,
        ValidationService,
        { provide: ToastrService, useClass: ToastrServiceStub },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { product: mockProduct } }
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
    matDialogRef = TestBed.inject(MatDialogRef);
    productService = TestBed.inject(ProductService);
    mediaService = TestBed.inject(MediaService);
    validationService = TestBed.inject(ValidationService);
    router = TestBed.inject(Router);
    toastrService = TestBed.inject(ToastrService);
    encryptionService = TestBed.inject(EncryptionService);
    fixture.detectChanges();
 
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create product form', () => {
    expect(component.productDetailForm).toBeTruthy();
  });

  it('should return an empty string when no encrypted secret is stored', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null); // Simulate no encrypted secret
    const userRole = component.userRole;
    expect(userRole).toEqual('');
  });

 
  it('should call getProductImages() and assign to productImages to display', fakeAsync(() => {
    spyOn(component, 'getProductImages').and.callThrough();
  
    const mockImages = [
      'data:image/jpeg;base64,/1',
      'data:image/jpeg;base64,/2',
    ];
  
    spyOn(mediaService, 'getImageByProductId').and.returnValue(of(['1', '2']));
    spyOn(mediaService, 'getImageByMediaId').and.callFake((mediaId: string) => {
        const blob = new Blob([mockImages[mediaId]], { type: 'image/jpeg' });
        return of(blob); // Simulate a successful result
    });
  
    component.getProductImages('productId');
  
    tick();
  
    expect(component.getProductImages).toHaveBeenCalled();
    expect(component.productImages).toEqual(mockImages);
  }));
  
  it('should update name field', () => {
    const fieldName = 'name';
    const fieldValue = 'New Product Name';
  
    spyOn(productService, 'updateProduct').and.returnValue(of({ success: true }));
  
    component.productDetailForm.controls[fieldName].setValue(fieldValue);
    component.product = {  
      id: '1',
      name: fieldName,
      description: 'Mock Product 1 description',
      price: 100,
      quantity: 10,
      editable: true
    };
  
    spyOn(component, 'updateField').and.callThrough();
  
   component.updateField(fieldName);
  
    expect(component.updateField).toHaveBeenCalled();
    expect(productService.updateProduct).toHaveBeenCalledWith(component.product);
    expect(component.editingField).toBeNull();
  });

  it('should handle error with status 403 or 401 for updateField()', fakeAsync(() => {
    const fieldName = 'name';
    const fieldValue = 'New Product Name';
    spyOn(component, 'updateField').and.callThrough();
  
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };

    component.productDetailForm.controls[fieldName].setValue(fieldValue);
    component.product = {  
      id: '1',
      name: fieldName,
      description: 'Mock Product 1 description',
      price: 100,
      quantity: 10,
      editable: true
    };

    spyOn(productService, 'updateProduct').and.returnValue(throwError(errorResponse));
    spyOn(toastrService, 'error');
    spyOn(router, 'navigate');

    component.updateField(fieldName);
    tick();

    expect(component.updateField).toHaveBeenCalled();
    expect(productService.updateProduct).toHaveBeenCalled();
    expect(toastrService.error).toHaveBeenCalledWith('Session expired. Log-in again.');
    
    expect(router.navigate).toHaveBeenCalledWith(['../login']);
  }));

  it('should open a confirmation dialog and delete the image when confirmed', fakeAsync(() => {
    const mockCurrentImage = { mediaId: '123' }; // Mock current image data
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of(true)); // Simulate user confirmation

    spyOn(matDialog, 'open').and.returnValue(dialogRef); // Mock the dialog open method

    spyOn(mediaService, 'deleteMedia').and.returnValue(of({ success: true }));
    spyOn(component, 'getProductImages');
    spyOn(mediaService.productMediaDeleted, 'emit');

    component.deleteImage(mockCurrentImage);

    tick();

    expect(matDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      data: { confirmationText: 'Delete this image?' },
    });
    expect(mediaService.deleteMedia).toHaveBeenCalledWith(mockCurrentImage.mediaId);
    expect(component.getProductImages).toHaveBeenCalled();
    expect(mediaService.productMediaDeleted.emit).toHaveBeenCalledWith(true);
  }));

  it('should open a confirmation dialog and not delete the image when not confirmed', fakeAsync(() => {
    const mockCurrentImage = { mediaId: '123' }; // Mock current image data
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of(false)); // Simulate user not confirming

    spyOn(matDialog, 'open').and.returnValue(dialogRef); // Mock the dialog open method

    spyOn(mediaService, 'deleteMedia');
    spyOn(component, 'getProductImages');
    spyOn(mediaService.productMediaDeleted, 'emit');

    component.deleteImage(mockCurrentImage);

    tick();

    expect(matDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      data: { confirmationText: 'Delete this image?' },
    });
    expect(mediaService.deleteMedia).not.toHaveBeenCalled();
    expect(component.getProductImages).not.toHaveBeenCalled();
    expect(mediaService.productMediaDeleted.emit).not.toHaveBeenCalled();
  }));

  it('should handle error with status 403 or 401 for deleteImage()', fakeAsync(() => {
    spyOn(component, 'deleteImage').and.callThrough();
    const mockCurrentImage = { mediaId: '123' }; // Mock current image data
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of(true)); // Simulate user not confirming
    
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };
    spyOn(matDialog, 'open').and.returnValue(dialogRef); // Mock the dialog open method  
    spyOn(mediaService, 'deleteMedia').and.returnValue(throwError(errorResponse));
    spyOn(toastrService, 'error');
    spyOn(router, 'navigate');

    component.deleteImage(mockCurrentImage);
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      data: { confirmationText: 'Delete this image?' },
    });
    expect(component.deleteImage).toHaveBeenCalled();
    expect(mediaService.deleteMedia).toHaveBeenCalled();
    expect(toastrService.error).toHaveBeenCalledWith('Session expired. Log-in again.');
    expect(router.navigate).toHaveBeenCalledWith(['../login']);
  }));

  it('should open a confirmation dialog and delete the product when confirmed', fakeAsync(() => {
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of(true)); // Simulate user confirmation

    spyOn(matDialog, 'open').and.returnValue(dialogRef); // Mock the dialog open method

    spyOn(productService, 'deleteProduct').and.returnValue(of({ success: true }));
    spyOn(productService.productDeleted, 'emit');

    component.deleteProduct();

    tick();

    expect(matDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      data: { confirmationText: 'Delete this product?' },
    });
    expect(productService.deleteProduct).toHaveBeenCalled();
    expect(productService.productDeleted.emit).toHaveBeenCalledWith(true);
  }));

  it('should handle error with status 403 or 401 for deleteProduct', fakeAsync(() => {
    spyOn(component, 'deleteProduct').and.callThrough();
    const dialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of(true)); // Simulate user confirmation

    spyOn(matDialog, 'open').and.returnValue(dialogRef); // Mock the dialog open method
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };

    spyOn(productService, 'deleteProduct').and.returnValue(throwError(errorResponse));
    spyOn(toastrService, 'error');
    spyOn(router, 'navigate');


    component.deleteProduct();
    tick();

    expect(matDialog.open).toHaveBeenCalledWith(jasmine.any(Function), {
      data: { confirmationText: 'Delete this product?' },
    });
    expect(productService.deleteProduct).toHaveBeenCalled();
    expect(toastrService.error).toHaveBeenCalledWith('Session expired. Log-in again.');
    expect(router.navigate).toHaveBeenCalledWith(['../login']);
  }));

  it('should save the selected files when the image limit is not exceeded', () => {
    const maxImageLimit = 5;
    component.noOfImages = maxImageLimit - 2; // Simulate having space for selected files
    const selectedFiles = [{ 
      file: new File([], 'image1.jpg'),
      url: 'image1.jpg',
     }];
    spyOn(component, 'saveEachSelectedFile');
    spyOn(mediaService.productMediaUpdated, 'emit');

    component.selectedFiles = selectedFiles;
    component.saveEditedImages();

    expect(component.saveEachSelectedFile).toHaveBeenCalledWith(component.product.id, 0);
    expect(mediaService.productMediaUpdated.emit).toHaveBeenCalledWith(true);
  });

  it('shoud not save the selected files when the image limit is exceeded', () => {
    const maxImageLimit = 5;
    component.noOfImages = maxImageLimit + 2; // Simulate exceeding space for selected files
    const selectedFiles = [{ 
      file: new File([], 'image1.jpg'),
      url: 'image1.jpg',
     }];
    spyOn(component, 'saveEachSelectedFile');
    spyOn(mediaService.productMediaUpdated, 'emit');
    spyOn(toastrService, 'error');

    component.selectedFiles = selectedFiles;
    component.saveEditedImages();

    expect(component.saveEachSelectedFile).not.toHaveBeenCalled();
    expect(mediaService.productMediaUpdated.emit).not.toHaveBeenCalled();
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
    spyOn(component, 'getProductImages');
  
    component.selectedFiles = selectedFiles;
    component.saveEachSelectedFile(productId, index);
    tick();
  
    expect(mediaService.uploadMedia).toHaveBeenCalled();
    expect(component.getProductImages).toHaveBeenCalled();
  }));

  it('should handle error with status 403 or 401 for saveEachSelectedFile()', fakeAsync(() => {
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

    spyOn(mediaService, 'uploadMedia').and.returnValue(throwError(errorResponse));
    spyOn(toastrService, 'error');
    spyOn(router, 'navigate');

    component.selectedFiles = selectedFiles;
    component.saveEachSelectedFile(productId, index);
    tick();

    expect(component.saveEachSelectedFile).toHaveBeenCalled();
    expect(mediaService.uploadMedia).toHaveBeenCalled();
    expect(toastrService.error).toHaveBeenCalledWith('Session expired. Log-in again.');
    expect(router.navigate).toHaveBeenCalledWith(['../login']);
  }));

   it('should return the token when it is valid', () => {
    const encryptedSecret = 'str';
    const decryptedSecret = JSON.stringify({ token: 'mockedToken' });
      
    spyOn(sessionStorage, 'getItem').and.returnValue(encryptedSecret);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate'); 

    spyOn(encryptionService, 'decrypt').and.returnValue(decryptedSecret);
  
    const token = productService.token;
  
    expect(token).toBe('mockedToken');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should navigate to login when the secret is invalid', () => {
    const encryptedSecret = 'str';
  
    spyOn(sessionStorage, 'getItem').and.returnValue(encryptedSecret);
  
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate'); // Create a spy for router.navigate
  
    spyOn(encryptionService, 'decrypt').and.throwError('Invalid decryption');
  
    const token = productService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['../login']);
  });
  
  it('should navigate to login when the secret is invalid', () => {
    const encryptedSecret = 'str';
  
    spyOn(sessionStorage, 'getItem').and.returnValue(encryptedSecret);
    spyOn(encryptionService, 'decrypt').and.throwError('Invalid decryption');
  
    const navigateSpy = spyOn(router, 'navigate'); // Mock the router.navigate method
  
    const token = productService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['../login']);
  });
  
  it('should return an empty string when no token is available', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    spyOn(encryptionService, 'decrypt'); // Mock the encryptionService.decrypt method
    const navigateSpy = spyOn(router, 'navigate'); // Mock the router.navigate method
  
    const token = productService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

});
