import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { AngularMaterialModule } from 'src/app/angular-material.module';

import { ProductComponent } from './product.component';
import { MediaListingComponent } from '../../media-listing/media-listing.component';
import { MediaComponent } from '../../media-listing/media/media.component';
import { Product } from 'src/app/Models/Product';

describe('ProductComponent', () => {
  let component: ProductComponent;
  let fixture: ComponentFixture<ProductComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductComponent, MediaListingComponent, MediaComponent],
      imports: [ToastrModule.forRoot(), HttpClientTestingModule, AngularMaterialModule],
    });

    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.componentInstance;

    // Create a dummy Product instance
    const dummyProduct: Product = {
      id: '1',
      name: 'shoes',
      description: 'new shoes',
      price: 23,
      quantity: 12,
      editable: true,
    };

    // Assign the dummy Product instance to the component's product input
    component.product = dummyProduct;


    component.product = {
      id: "1", 
      name: 'Mock Product',
      price: 10.0, 
      quantity: 1,
      description: 'Mock Description',
      editable: false, 
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
