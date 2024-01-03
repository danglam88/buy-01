import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { OrderHistoryComponent } from './order-history.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ToastrModule } from 'ngx-toastr';
import { OrderService } from 'src/app/services/order.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { SearchComponent } from '../../search/search.component';


describe('OrderHistoryComponent', () => {
  let component: OrderHistoryComponent;
  let fixture: ComponentFixture<OrderHistoryComponent>;

  let orderService: jasmine.SpyObj<OrderService>;

  beforeEach(async () => {
    orderService = jasmine.createSpyObj('OrderService', ['getClientOrders', 'redoOrder', 'getSellerOrderItems', 'cancelOrder', 'removeOrder']);

    await TestBed.configureTestingModule({
      declarations: [OrderHistoryComponent, SearchComponent],
      imports: [MatDialogModule, ToastrModule.forRoot(), HttpClientTestingModule, AngularMaterialModule],
      providers: [
        { provide: OrderService, useValue: { 
          getClientOrders: () => of({ orders: [] }),
          redoOrder: () => of({}),
        } },
      ],
    }).compileComponents();
  });
  

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should get client orders with seller info for CLIENT role', fakeAsync(() => {
    component.role = 'CLIENT';
    spyOn(component, 'getClientOrdersWithSellerInfo').and.callThrough();
    
    component.ngOnInit();
    tick();

    expect(component.getClientOrdersWithSellerInfo).toHaveBeenCalled();
  }));

  it('should get seller order items for SELLER role', fakeAsync(() => {
    component.role = 'SELLER';
    spyOn(component, 'getSellerOrderItems').and.callThrough();
    
    component.ngOnInit();
    tick();

    expect(component.getSellerOrderItems).toHaveBeenCalled();
  }));

});
