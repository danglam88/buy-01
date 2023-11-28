import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { of } from 'rxjs';

import { ProductDashboardComponent } from './product-dashboard.component';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ProductComponent } from '../product-listing/product/product.component';

import { ProductService } from 'src/app/services/product.service';
import { ValidationService } from 'src/app/services/validation.service';
import { ErrorService } from 'src/app/services/error.service';
import { ToastrService } from 'ngx-toastr';

class ToastrServiceStub {
  error(message: string) {}
  success(message: string) {}
}

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of(true), 
    };
  }
}

describe('ProductDashboardComponent', () => {
  let component: ProductDashboardComponent;
  let fixture: ComponentFixture<ProductDashboardComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let errorService: ErrorService;
  let dialog: MatDialog;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ProductService', ['getSellerProductsInfo']);
    
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
        { provide: MatDialog, useClass: MatDialogMock },
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
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    errorService = TestBed.inject(ErrorService);
    dialog = TestBed.inject(MatDialog);
    spyOn(component, 'getSellerProducts').and.callThrough();
   });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getSellerProducts() and retrieve seller products info', fakeAsync(() => {  
    productService.getSellerProductsInfo.and.returnValue(of([]));

    component.ngOnInit();
    tick();

   expect(productService.getSellerProductsInfo).toHaveBeenCalled();
  }));
  
  
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
