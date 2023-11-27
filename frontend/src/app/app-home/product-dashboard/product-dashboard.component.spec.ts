import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { of, Observable } from 'rxjs';

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
  let productService: jasmine.SpyObj<ProductService>;
  let errorService: ErrorService;

    // Create a mock MatDialogRef
    const mockDialogRef = {
      open: jasmine.createSpy('open')
    };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ProductService', ['getSellerProductsInfo']);
    let mockSellerProducts = [
      {
        "id": "1",
        "name": "Mock Product 1",
        "description": "Mock Product 1 description",
        "price": 100,
        "quantity": 10,
        "editable": true,
        "productMedia": []
      }
    ];
    TestBed.configureTestingModule({
      declarations: [
        ProductDashboardComponent, 
        ProductDetailComponent, 
        HeaderComponent,
        FooterComponent,
        ProductComponent       
      ],
      providers: [
        ValidationService,
        ErrorService,
        { provide: ProductService, useValue: spy },
        { provide: MatDialogRef, useValue: mockDialogRef }, 
        { provide: MAT_DIALOG_DATA, useValue: {product: mockSellerProducts} },
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
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    errorService = TestBed.inject(ErrorService);
    spyOn(component, 'getSellerProducts').and.callThrough();
    spyOn(component, 'openProductDetail').and.callThrough();
    spyOn(productService, 'getSellerProductsInfo').and.returnValue(of(mockSellerProducts));
    spyOn(component['dialog'], 'open').and.callThrough(); 
   });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getSellerProducts() and retrieve seller products info', () => {  
    component.getSellerProducts();
  
    expect(component.getSellerProducts).toHaveBeenCalled();
    component.sellerProducts$.subscribe((products) => {
      expect(productService.getSellerProductsInfo).toHaveBeenCalled();  
      expect(products.every(product => product.editable === true)).toBeTrue();
    });

  });
  
  
  it('should open product detail', () => {
    const mockProductDetails = {
      "id": "1",
      "name": "Mock Product 1",
      "description": "Mock Product 1 description",
      "price": 100,
      "quantity": 10,
      "editable": true,
      "productMedia": []
    };
  
    component.openProductDetail(mockProductDetails);
    expect(component['dialog'].open).toHaveBeenCalled(); 
  });
  
  it('should show <p>You have no products!</p> when sellerProducts is empty', () => {
    const mockSellerProducts = [];
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    productService.getSellerProductsInfo.and.returnValue(of(mockSellerProducts));
    expect(compiled.querySelector('p').textContent).toContain('You have no products!');
  });

  it('should call getSellerProducts() when productCreated is emitted', () => {
    spyOn(productService.productCreated, 'subscribe').and.callThrough();
    productService.productCreated.emit(true);
    expect(component.getSellerProducts).toHaveBeenCalled();
  });

  it('should call getSellerProducts() when productDeleted is emitted', () => {
    spyOn(productService.productDeleted, 'subscribe').and.callThrough();
    productService.productDeleted.emit(true);
    expect(component.getSellerProducts).toHaveBeenCalled();
  });

  it('should handle error with status 403 for getSellerProducts', fakeAsync(() => {  
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };

    productService.getSellerProductsInfo.and.returnValue(new Observable((observer) => {
      observer.error(errorResponse);
      observer.complete();
    }));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpirationError');

   
    component.getSellerProducts();
    tick();

    expect(component.getSellerProducts).toHaveBeenCalled();
    component.sellerProducts$.subscribe(() => {   
      expect(productService.getSellerProductsInfo).not.toHaveBeenCalled();
      expect(errorService.isAuthError).toHaveBeenCalledWith(403);
      expect(errorService.handleSessionExpirationError).toHaveBeenCalled();
    });
  }));
});
