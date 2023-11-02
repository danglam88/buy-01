import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { of } from 'rxjs';

import { ProductDashboardComponent } from './product-dashboard.component';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ProductComponent } from '../product-listing/product/product.component';

import { ProductService } from 'src/app/services/product.service';
import { ToastrService } from 'ngx-toastr';
import { ValidationService } from 'src/app/services/validation.service';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; 

describe('ProductDashboardComponent', () => {
  let component: ProductDashboardComponent;
  let fixture: ComponentFixture<ProductDashboardComponent>;
  let productService: ProductService;
  let httpTestingController: HttpTestingController;
  let validationService: ValidationService;

    // Create a mock MatDialogRef
    const mockDialogRef = {
      open: jasmine.createSpy('open')
    };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProductDashboardComponent, 
        ProductDetailComponent, 
        HeaderComponent,
        FooterComponent,
        ProductComponent       
      ],
      providers: [
        ProductService,
        ValidationService,
        { provide: ToastrService, useValue: { error: jasmine.createSpy('error'), success: jasmine.createSpy('success') } },
        { provide: MatDialogRef, useValue: mockDialogRef }, // Provide the mock MatDialogRef
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
      imports: [
        RouterTestingModule, 
        HttpClientTestingModule,
        AngularMaterialModule,
        BrowserAnimationsModule
      ]
    });
    fixture = TestBed.createComponent(ProductDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    productService = TestBed.inject(ProductService);
    validationService = TestBed.inject(ValidationService);
    httpTestingController = TestBed.inject(HttpTestingController);
   });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get seller products and change editable property to true', () => {
    spyOn(component, 'getSellerProducts').and.callThrough();
    const mockProducts = [
      {
        "id": "1",
        "name": "Mock Product 1",
        "description": "Mock Product 1 description",
        "price": 100,
        "quantity": 10,
      }
    ];
  
    // Mock the response from the productService
    spyOn(productService, 'getSellerProductsInfo').and.returnValue(of(mockProducts));
  
    component.getSellerProducts();
  
    expect(component.getSellerProducts).toHaveBeenCalled();
    expect(productService.getSellerProductsInfo).toHaveBeenCalled();
  
    // After getSellerProducts is called, the component.sellerProducts should be equal to the mockProducts
    expect(component.sellerProducts).toEqual(mockProducts);
  
    // Additionally, check that the editable property is set to true for each product
    expect(component.sellerProducts.every(product => product.editable === true)).toBeTrue();
  });
  
  
  it('should open product detail', () => {
    spyOn(component['dialog'], 'open').and.callThrough(); // Access the dialog service directly and spy on open
    const mockProduct = {
      "id": "1",
      "name": "Mock Product 1",
      "description": "Mock Product 1 description",
      "price": 100,
      "quantity": 10,
      "editable": true
    };
  
    component.openProductDetail(mockProduct);
    expect(component['dialog'].open).toHaveBeenCalled(); // Access the dialog service directly
  });
  
  it('should show <p>You have no products!</p> when sellerProducts is empty', () => {
    component.sellerProducts = [];
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('p').textContent).toContain('You have no products!');
  });

  it('should subscribe to productCreated event and call getSellerProducts when productCreated is emitted', () => {
    spyOn(component, 'getSellerProducts');
    const productCreatedEventSpy = spyOn(productService.productCreated, 'subscribe');

    productCreatedEventSpy.and.callThrough(); // Just pass the callback through

    productService.productCreated.emit(true);

    expect(component.getSellerProducts).toHaveBeenCalled();
  });

  it('should subscribe to productDeleted event and call getSellerProducts when productDeleted is emitted', () => {
    spyOn(component, 'getSellerProducts');
    const productDeletedEventSpy = spyOn(productService.productDeleted, 'subscribe');

    productDeletedEventSpy.and.callThrough(); // Just pass the callback through

    productService.productDeleted.emit(true);

    expect(component.getSellerProducts).toHaveBeenCalled();
  });
});
