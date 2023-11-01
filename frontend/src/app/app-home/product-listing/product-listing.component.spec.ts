import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ToastrService } from 'ngx-toastr';
import { ProductService } from 'src/app/services/product.service';

import { ProductListingComponent } from './product-listing.component';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

describe('ProductListingComponent', () => {
  let component: ProductListingComponent;
  let fixture: ComponentFixture<ProductListingComponent>;
  let productService: ProductService;
  let toastrService: ToastrService;

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
        { provide: ToastrService, useValue: { error: jasmine.createSpy('error'), success: jasmine.createSpy('success') } },
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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getAllProducts() on init and display', () => {
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
    component.ngOnInit();
    expect(component.getAllProducts).toHaveBeenCalled();
    //expect(component.products).toEqual(mockProducts);
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
  
});
