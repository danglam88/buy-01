import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Import HttpClientTestingModule
import { AngularMaterialModule } from 'src/app/angular-material.module';

import { ProductDashboardComponent } from './product-dashboard.component';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ProductComponent } from '../product-listing/product/product.component';

import { ProductService } from 'src/app/services/product.service';
import { ToastrService } from 'ngx-toastr';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; // Import MatDialogRef



describe('ProductDashboardComponent', () => {
  let component: ProductDashboardComponent;
  let fixture: ComponentFixture<ProductDashboardComponent>;
  let productService: ProductService;
  let httpTestingController: HttpTestingController;

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
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
