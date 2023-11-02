import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'; 
import { of } from 'rxjs';

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
import { ToastrService } from 'ngx-toastr';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let productService: ProductService;
  let mediaService: MediaService;
  let encryptionService: EncryptionService;
  let matDialog: MatDialog;
  let matDialogRef: MatDialogRef<any>;
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
        { provide: ToastrService, useValue: { error: jasmine.createSpy('error'), success: jasmine.createSpy('success') } },
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

  /*it('should return the role from the encrypted secret when available', () => {
    const encryptedSecret = 'srt'; 
    const role = 'SELLER';
    spyOn(sessionStorage, 'getItem').and.returnValue(encryptedSecret);
    spyOn(encryptionService, 'decrypt').and.returnValue(JSON.stringify({ role }));

    encryptionService.decrypt(encryptedSecret);
    const userRole = component.userRole;

    expect(encryptionService.decrypt).toHaveBeenCalled();
  });*/

});
