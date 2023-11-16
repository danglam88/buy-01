import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { of, throwError } from 'rxjs';

import { ProductDashboardComponent } from './product-dashboard.component';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ProductComponent } from '../product-listing/product/product.component';

import { ProductService } from 'src/app/services/product.service';
import { ValidationService } from 'src/app/services/validation.service';
import { ErrorService } from 'src/app/services/error.service';
import { ToastrService } from 'ngx-toastr';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; 

class ToastrServiceStub {
  error(message: string) {
    // Do nothing in the stub
  }
  success(message: string) {
    // Do nothing in the stub
  }
}

describe('ProductDashboardComponent', () => {
  let component: ProductDashboardComponent;
  let fixture: ComponentFixture<ProductDashboardComponent>;
  let productService: ProductService;
  let errorService: ErrorService;

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
        ErrorService,
        { provide: MatDialogRef, useValue: mockDialogRef }, // Provide the mock MatDialogRef
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ToastrService, useClass: ToastrServiceStub },
      ],
      imports: [
        HttpClientTestingModule,
        AngularMaterialModule,
        BrowserAnimationsModule
      ]
    });
    fixture = TestBed.createComponent(ProductDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    productService = TestBed.inject(ProductService);
    errorService = TestBed.inject(ErrorService);
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

  it('should handle error with status 403 for getSellerProducts', fakeAsync(() => {
    spyOn(component, 'getSellerProducts').and.callThrough();
  
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };

    spyOn(productService, 'getSellerProductsInfo').and.returnValue(throwError(errorResponse));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpiration');

   
    component.getSellerProducts();
    tick();

    expect(component.getSellerProducts).toHaveBeenCalled();
    expect(productService.getSellerProductsInfo).toHaveBeenCalled();
    expect(errorService.isAuthError).toHaveBeenCalledWith(403);
    expect(errorService.handleSessionExpiration).toHaveBeenCalled();
  }));

  it('should handle error with status 401 for getSellerProducts', fakeAsync(() => {
    spyOn(component, 'getSellerProducts').and.callThrough();
  
    const errorResponse = {
      status: 401,
      error: 'Unauthorized',
    };

    spyOn(productService, 'getSellerProductsInfo').and.returnValue(throwError(errorResponse));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpiration');

   
    component.getSellerProducts();
    tick();

    expect(component.getSellerProducts).toHaveBeenCalled();
    expect(productService.getSellerProductsInfo).toHaveBeenCalled();
    expect(errorService.isAuthError).toHaveBeenCalledWith(401);
    expect(errorService.handleSessionExpiration).toHaveBeenCalled();
  }));
});
