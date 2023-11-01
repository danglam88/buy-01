import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'; // Import 'fakeAsync' and 'tick'

import { HttpClientTestingModule } from '@angular/common/http/testing'; 
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ProductDetailComponent } from './product-detail.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProductService } from 'src/app/services/product.service';
import { MediaService } from 'src/app/services/media.service';
import { ToastrService } from 'ngx-toastr';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let productService: ProductService;
  let mediaService: MediaService;

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

    TestBed.configureTestingModule({
      declarations: [ProductDetailComponent],
      providers: [
        ProductService,
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

  it('should call getProductImages() on init', () => {
    spyOn(component, 'getProductImages');
    component.ngOnInit();
    expect(component.getProductImages).toHaveBeenCalled();
    // i expect the productImages to be an array of base64 strings
  });

  /*it('should call deleteProduct and delete product if user confirms via dialogReg', () => {
    spyOn(productService, 'deleteProduct').and.callThrough();
    let mockProduct = {
      name: 'Mock Product',
      description: 'Mock Product Description',
      price: 100,
      quantity: 10,
    };

    component.deleteProduct();
    tick(); // Use 'tick' within the test case
    
    expect(productService.deleteProduct(mockProduct)).toHaveBeenCalled();
  });*/
});
