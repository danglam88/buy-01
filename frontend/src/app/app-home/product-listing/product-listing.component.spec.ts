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
      afterClosed: () => of(true), 
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
   productService.getAllProductsInfo.and.returnValue(of([]));

    component.ngOnInit();
    tick();

    expect(productService.getAllProductsInfo).toHaveBeenCalled();
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
