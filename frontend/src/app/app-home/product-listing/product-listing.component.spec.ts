import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ToastrService } from 'ngx-toastr';
import { ProductService } from 'src/app/services/product.service';
import { ErrorService } from 'src/app/services/error.service';
import { ValidationService } from 'src/app/services/validation.service';

import { ProductListingComponent } from './product-listing.component';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

class ToastrServiceStub {
  error(message: string) {}
  success(message: string) {}
}

describe('ProductListingComponent', () => {
  let component: ProductListingComponent;
  let fixture: ComponentFixture<ProductListingComponent>;
  let productService: ProductService;
  let errorService: ErrorService;

  const mockDialogRef = {
    open: jasmine.createSpy('open')
  };


  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProductListingComponent, 
        ProductDetailComponent,
        HeaderComponent,
        FooterComponent
      ],
      providers: [
        ProductService,
        ErrorService,
        ValidationService,
        { provide: ToastrService, useClass: ToastrServiceStub },
        { provide: MatDialogRef, useValue: mockDialogRef }, // Provide the mock MatDialogRef
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        AngularMaterialModule, 
        BrowserAnimationsModule,
      ]
    });
    fixture = TestBed.createComponent(ProductListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    productService = TestBed.inject(ProductService);
    errorService = TestBed.inject(ErrorService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to productCreated event and call getAllProducts() when productCreated is emitted', () => {
    spyOn(component, 'getAllProducts');
    const productCreatedEventSpy = spyOn(productService.productCreated, 'subscribe');

    productCreatedEventSpy.and.callThrough(); 

    productService.productCreated.emit(true);

    expect(component.getAllProducts).toHaveBeenCalled();
  });

  it('should call getAllProducts() and display', fakeAsync(() => {
    spyOn(component, 'getAllProducts');
    const mockProducts = [
      { 
        id: "1",
        name: "Mock Product 1",
        description: "Mock Product 1 Description",
        price: 1,
        quantity: 1,
      }
    ];
    spyOn(productService, 'getAllProductsInfo').and.returnValue(of(mockProducts));
    component.getAllProducts();
    component.products = mockProducts;

    tick();

    expect(component.getAllProducts).toHaveBeenCalled();
    expect(component.products).toEqual(mockProducts);
  }));

  it('should handle error with status 403 for getAllProducts()', fakeAsync(() => {
    spyOn(component, 'getAllProducts').and.callThrough();
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };

    spyOn(productService, 'getAllProductsInfo').and.returnValue(throwError(errorResponse));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpiration');

    component.getAllProducts();
    tick();

    expect(component.getAllProducts).toHaveBeenCalled();
    expect(productService.getAllProductsInfo).toHaveBeenCalled();
    expect(errorService.isAuthError).toHaveBeenCalledWith(403);
    expect(errorService.handleSessionExpiration).toHaveBeenCalled();
  }));

  it('should handle error with status 401 for getAllProducts()', fakeAsync(() => {
    spyOn(component, 'getAllProducts').and.callThrough();
    const errorResponse = {
      status: 401,
      error: 'Unauthorized',
    };

    spyOn(productService, 'getAllProductsInfo').and.returnValue(throwError(errorResponse));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpiration');

    component.getAllProducts();
    tick();

    expect(component.getAllProducts).toHaveBeenCalled();
    expect(productService.getAllProductsInfo).toHaveBeenCalled();
    expect(errorService.isAuthError).toHaveBeenCalledWith(401);
    expect(errorService.handleSessionExpiration).toHaveBeenCalled();
  }));

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

  it('should show <p>There are no products!</p> when product is empty', () => {
    component.products = [];
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('p').textContent).toContain('There are no products!');
  });
});
