import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListingComponent } from './product-listing.component';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import  {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('ProductListingComponent', () => {
  let component: ProductListingComponent;
  let fixture: ComponentFixture<ProductListingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductListingComponent,
        HeaderComponent,
        FooterComponent], 
      imports: [AngularMaterialModule,
        HttpClientTestingModule,
        ToastrModule.forRoot(),
        BrowserAnimationsModule],
    });
    fixture = TestBed.createComponent(ProductListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
