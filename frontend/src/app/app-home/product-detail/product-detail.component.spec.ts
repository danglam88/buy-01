import { ComponentFixture, TestBed } from '@angular/core/testing';

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
    const mockProduct = {
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
        { provide: MatDialogRef, useValue: mockDialogRef }, // Provide the mock MatDialogRef
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
});
