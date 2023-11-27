/*import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, Observable, Subject } from 'rxjs';

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
import { SearchComponent } from '../search/search.component';

class ToastrServiceStub {
  error(message: string) {}
  success(message: string) {}
}

describe('ProductListingComponent', () => {
  let component: ProductListingComponent;
  let fixture: ComponentFixture<ProductListingComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let errorService: ErrorService;

  const mockDialogRef = {
    open: jasmine.createSpy('open')
  };

  const mockAllProducts = [
    { 
      id: "1",
      name: "Mock Product 1",
      description: "Mock Product 1 Description",
      price: 1,
      quantity: 1
    }
  ];

  beforeEach(() => {
    const productCreatedSubject = new Subject<boolean>();
    const productServiceSpy  = jasmine.createSpyObj('ProductService', {
      getAllProductsInfo: of(mockAllProducts)
    });
    TestBed.configureTestingModule({
      declarations: [
        ProductListingComponent, 
        ProductDetailComponent,
        HeaderComponent,
        FooterComponent,
        SearchComponent
      ],
      providers: [
        ErrorService,
        ValidationService,
        { provide: ProductService, useValue: productServiceSpy },
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
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    errorService = TestBed.inject(ErrorService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnInit()', () => {
   
     spyOn(productService.productCreated, 'subscribe').and.callThrough();
     spyOn(component, 'getAllProducts').and.callThrough();
     spyOn(productService, 'getAllProductsInfo').and.callThrough();
      component.ngOnInit();
    expect(component.ngOnInit).toHaveBeenCalled();
    expect(productService.productCreated.emit).toHaveBeenCalledWith(true);
    expect(component.getAllProducts).toHaveBeenCalled();
  });

  it('should call getAllProducts() and display', fakeAsync(() => {
    spyOn(component, 'getAllProducts').and.callThrough();
    spyOn(productService, 'getAllProductsInfo').and.callThrough();
     component.getAllProducts();
     productService.getAllProductsInfo.and.returnValue(of(mockAllProducts));
    tick();

    expect(component.getAllProducts).toHaveBeenCalled();
    expect(productService.getAllProductsInfo).toHaveBeenCalledWith();   
    expect(component.allProducts$).toBeDefined();
    component.allProducts$.subscribe((data) => {
      expect(data).toEqual(mockAllProducts);
    });
  }));

  it('should handle error with status 403 for getAllProducts()', fakeAsync(() => {
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };
    spyOn(component, 'getAllProducts').and.callThrough();
    productService.getAllProductsInfo.and.returnValue(new Observable((observer) => {
      observer.error(errorResponse);
      observer.complete();
    }));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpirationError');

    component.getAllProducts();
    tick();

    expect(component.getAllProducts).toHaveBeenCalled();  
    expect(productService.getAllProductsInfo).not.toHaveBeenCalled();
    expect(errorService.isAuthError).toHaveBeenCalledWith(403);
    expect(errorService.handleSessionExpirationError).toHaveBeenCalled();
  }));

  it('should open product detail', () => {
    spyOn(component['dialog'], 'open').and.callThrough(); 
    const mockProduct = {
      "id": "1",
      "name": "Mock Product 1",
      "description": "Mock Product 1 description",
      "price": 100,
      "quantity": 10,
      "editable": true,
      "productMedia": []
    };
  
    component.openProductDetail(mockProduct);
    expect(component['dialog'].open).toHaveBeenCalled(); 
  });
});*/


import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from 'src/app/angular-material.module';

import { ProductService } from 'src/app/services/product.service';
import { ToastrService } from 'ngx-toastr';
import { ErrorService } from 'src/app/services/error.service';

import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductListingComponent } from './product-listing.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SearchComponent } from '../search/search.component';

class ToastrServiceStub {
  error(message: string) {}
  success(message: string) {}
}

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of(true), // Mock the afterClosed method if needed
    };
  }
}

describe('ProductListingComponent', () => {
  let component: ProductListingComponent;
  let fixture: ComponentFixture<ProductListingComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let errorService: ErrorService;
  let dialog: MatDialog;

  beforeEach(() => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getAllProductsInfo']);
    TestBed.configureTestingModule({
      declarations: [ProductListingComponent, SearchComponent, HeaderComponent, FooterComponent],
      providers: [
        ErrorService,
        { provide: ProductService, useValue: productServiceSpy },
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: ToastrService, useClass: ToastrServiceStub },
      ],
      imports: [RouterTestingModule, HttpClientTestingModule, AngularMaterialModule, BrowserAnimationsModule],
    });
    fixture = TestBed.createComponent(ProductListingComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    errorService = TestBed.inject(ErrorService);
    dialog = TestBed.inject(MatDialog);
    spyOn(component, 'getAllProducts').and.callThrough();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getAllProducts on ngOnInit and on productCreated', fakeAsync(() => {
    const mockProductCreated = true;

   productService.getAllProductsInfo.and.returnValue(of([]));

    component.ngOnInit();
    tick();

    expect(productService.getAllProductsInfo).toHaveBeenCalled();
    productService.productCreated.next(mockProductCreated);
    tick();

    expect(productService.getAllProductsInfo).toHaveBeenCalledTimes(2);
  }));

  it('should set searchText on setSearchText', () => {
    const mockSearchText = 'test';

    component.setSearchText(mockSearchText);

    expect(component.searchText).toEqual(mockSearchText);
  });

  it('should open product detail modal', () => {
    const mockProduct: any = {}; 
    spyOn(dialog, 'open').and.callThrough();

    component.openProductDetail(mockProduct);

    expect(dialog.open).toHaveBeenCalledWith(ProductDetailComponent, {
      data: {
        product: mockProduct,
      },
    });
  });
});
