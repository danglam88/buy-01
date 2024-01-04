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
import { SearchComponent } from '../search/search.component';

import { ProductService } from 'src/app/services/product.service';
import { ValidationService } from 'src/app/services/validation.service';
import { ErrorService } from 'src/app/services/error.service';
import { ToastrModule } from 'ngx-toastr';

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
        ProductComponent,
        SearchComponent       
      ],
      providers: [
        ValidationService,
        ErrorService,
        { provide: ProductService, useValue: spy },
        { provide: MatDialog, useClass: MatDialogMock },
      ],
      imports: [
        HttpClientTestingModule,
        AngularMaterialModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot()
      ]
    });
    fixture = TestBed.createComponent(ProductDashboardComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
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

  it('should set searchText', () => {
    const mockSearchText: string[] = ['test', 'search'];

    component.setSearchText(mockSearchText);

    expect(component.searchText).toEqual(mockSearchText);
  });

  it('should set selectedFilterRadioButton', () => {
    const mockFilter: string = 'under100';

    component.onFilterChanged(mockFilter);

    expect(component.selectedFilterRadioButton).toEqual(mockFilter);
  });
});
