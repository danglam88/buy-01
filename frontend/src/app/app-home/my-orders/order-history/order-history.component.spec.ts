import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrService } from 'ngx-toastr';

import { OrderHistoryComponent } from './order-history.component';
import { OrderDetailsComponent } from '../order-details/order-details.component';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { SearchComponent } from '../../search/search.component';

import { UserService } from 'src/app/services/user.service';
import { OrderService } from 'src/app/services/order.service';
import { OrderItemService } from 'src/app/services/order-item.service';
import { CartService } from 'src/app/services/cart.service';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

class ToastrServiceStub {
  error(message: string) {}
  success(message: string) {}
}

describe('OrderHistoryComponent', () => {
  let component: OrderHistoryComponent;
  let fixture: ComponentFixture<OrderHistoryComponent>;
  let orderService: jasmine.SpyObj<OrderService>;
  let orderItemService: jasmine.SpyObj<OrderItemService>;
  let cartService: jasmine.SpyObj<CartService>;
  let userService: jasmine.SpyObj<UserService>;
  let toastrService: ToastrService;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    orderService = jasmine.createSpyObj('OrderService', ['getClientOrders', 'getSellerOrderItems', 'cancelOrder', 'redoOrder', 'removeOrder']);
    orderItemService = jasmine.createSpyObj('OrderItemService', ['updateOrderItemStatus']);
    orderItemService.itemCancelledId$ = of("false");
    cartService = jasmine.createSpyObj('CartService', ['getCartItem', 'setItemId', 'isItemAddedToCart']);
    userService = jasmine.createSpyObj('UserService', ['getUserById']);
 
    TestBed.configureTestingModule({
      declarations: [
        OrderHistoryComponent, 
        OrderDetailsComponent, 
        ConfirmationDialogComponent,
        SearchComponent
      ],
      providers: [
        UserService, 
        OrderService, 
        OrderItemService,
        { provide: ToastrService, useClass: ToastrServiceStub },
        { provide: OrderService, useValue: orderService },
        { provide: OrderItemService, useValue: orderItemService },
        { provide: CartService, useValue: cartService },
        { provide: UserService, useValue: userService },
      ],
      imports: [AngularMaterialModule, HttpClientTestingModule]
    });
    fixture = TestBed.createComponent(OrderHistoryComponent);
    component = fixture.componentInstance;
    toastrService = TestBed.inject(ToastrService);
    fixture.detectChanges();
    spyOn(component, 'getClientOrdersWithSellerInfo').and.callThrough();
    spyOn(component, 'getSellerOrderItems').and.callThrough();
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    spyOn(dialog, 'open').and.callThrough();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should call getClientOrdersWithSellerInfo if role is CLIENT', () => {
    component.role = 'CLIENT';
    component.ngOnInit();
    
    expect(component.getClientOrdersWithSellerInfo).toHaveBeenCalled();
  });
  
  it('should call getSellerOrderItems if role is SELLER', () => {    
    component.role = 'SELLER';
    component.ngOnInit();
    
    expect(component.getSellerOrderItems).toHaveBeenCalled();
  });

  it('should call getClientOrdersWithSellerInfo if an item is cancelled', () => {
    orderItemService.itemCancelledId$ = of("true");  
    component.ngOnInit();
  
    expect(component.getClientOrdersWithSellerInfo).toHaveBeenCalled();
  });

  it('should open OrderDetailsComponent with correct data', () => {
    const mockOrderDetail = {};

    component.openProductDetail(mockOrderDetail);

    expect(dialog.open).toHaveBeenCalledWith(OrderDetailsComponent, {
      data: {
        order: mockOrderDetail,
        role: component.role,
        view: 'history',
      },
    });
  });

  it('should set search text', () => {
    const searchText = ['keyword1', 'keyword2'];
    component.setSearchText(searchText);

    expect(component.searchText).toEqual(searchText);
  });

  it('should show client orders based on search text', () => {
    component.searchText = ['keyword1'];
    const mockOrder = {
      items: [
        { name: 'keyword1' },
        { name: 'Item2' },
        { name: 'Item3' },
      ],
    };

    expect(component.shouldShowClientOrders(mockOrder)).toBe(true);

    component.searchText = ['nonMatchingKeyword'];
    expect(component.shouldShowClientOrders(mockOrder)).toBe(false);
  });
  it('should show seller order items based on search text', () => {

    component.searchText = ['keyword1'];
    const mockItem = { name: 'keyword1' };

    expect(component.shouldShowSellerOrderItems(mockItem)).toBe(true);
    component.searchText = ['nonMatchingKeyword'];
    expect(component.shouldShowSellerOrderItems(mockItem)).toBe(false);
  });

  it('should get client orders with seller info', () => {
    const mockClientOrders = {
      orders: [
        {
          items: [
            { seller_id: 'seller1' },
            { seller_id: 'seller2' },
          ],
        },
      ],
    };

    const mockSellerInfo = {
      name: 'SellerName',
      email: 'seller@example.com',
    };

    orderService.getClientOrders.and.returnValue(of(mockClientOrders));
    userService.getUserById.and.returnValue(of(mockSellerInfo));

    component.getClientOrdersWithSellerInfo();

    expect(orderService.getClientOrders).toHaveBeenCalled();
    expect(userService.getUserById).toHaveBeenCalledTimes(2); 
    expect(component.allTrans$).toBeDefined();

    component.allTrans$.subscribe((result) => {
      expect(result).toEqual([
        {
          items: [
            { seller_id: 'seller1', sellerInfo: mockSellerInfo },
            { seller_id: 'seller2', sellerInfo: mockSellerInfo },
          ],
        },
      ]);
    });
  });

  it('should retrieve and process seller order items', () => {
    const mockSellerOrderItemsResponse = {
      items: [
        { buyer_id: 'buyer1' },
        { buyer_id: 'buyer2'},
      ],
    };

    const mockBuyerInfo = {
      name: 'SellerName',
      email: 'seller@example.com',
    };

    orderService.getSellerOrderItems.and.returnValue(of(mockSellerOrderItemsResponse));
    userService.getUserById.and.returnValue(of(mockBuyerInfo));
    component.getSellerOrderItems();
    
    expect(orderService.getSellerOrderItems).toHaveBeenCalled();
    expect(userService.getUserById).toHaveBeenCalledTimes(2); 
    expect(component.allTrans$).toBeDefined();
    component.allTrans$.subscribe((result) => {
      expect(result).toEqual([
        { buyer_id: 'buyer1', buyerInfo: mockBuyerInfo },
        { buyer_id: 'buyer2', buyerInfo: mockBuyerInfo },
      ]);
    });
  });
  
});