import {
  ComponentFixture,
  TestBed,
  tick,
  fakeAsync,
  flush,
} from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { MatDialog } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { of } from "rxjs";
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CartComponent } from "./cart.component";
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { OrderDetailsComponent } from "../my-orders/order-details/order-details.component";

import { CartService } from "src/app/services/cart.service";
import { OrderService } from "src/app/services/order.service";
import { UserService } from "src/app/services/user.service";
import { CartItems } from "src/app/Models/CartItems";
import { Product } from "src/app/Models/Product";

describe("CartComponent", () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let router: Router;

  let mockCartService: jasmine.SpyObj<CartService>;
  let mockOrderService: jasmine.SpyObj<OrderService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockMatDialog: jasmine.SpyObj<MatDialog>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    mockCartService = jasmine.createSpyObj("CartService", [
      "getCart",
      "changeQuantity",
      "removeFromCart",
      "isItemAddedToCart",
      "removeCartItems",
      "clearCart"
    ]);
    mockOrderService = jasmine.createSpyObj("OrderService", [
      "createOrder",
      "getOrderByOrderId",
    ]);
    mockUserService = jasmine.createSpyObj("UserService", ["getUserById"]);
    mockMatDialog = jasmine.createSpyObj("MatDialog", ["open"]);
    mockToastrService = jasmine.createSpyObj("ToastrService", [
      "success",
      "error",
    ]);

    TestBed.configureTestingModule({
      declarations: [CartComponent, HeaderComponent, FooterComponent, OrderDetailsComponent],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: CartService, useValue: mockCartService },
        { provide: OrderService, useValue: mockOrderService },
        { provide: UserService, useValue: mockUserService },
        { provide: MatDialog, useValue: mockMatDialog },
        { provide: ToastrService, useValue: mockToastrService },
      ],
    });

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it('should set cart items using setCart method', fakeAsync(() => {
    const mockCartData = [{ product: { id: '1', name: 'Product 1', price: 10 }, quantity: 2, item_price: 20, itemId: '123' }];
  
    mockCartService.getCart.and.returnValue(of(mockCartData));
  
    component.setCart();
    tick();
  
    expect(component.cart.items.length).toBe(1);
    expect(component.cart.items[0].product.id).toBe('1');
  }));

  it('should return an array of numbers up to the given quantity', () => {
    const quantity = 5;
    const result = component.getQuantityOptions(quantity);
  
    expect(result.length).toBe(quantity);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });
  

  /*it('should call changeQuantity service method with correct parameters', fakeAsync(() => {
    const mockCartItem = new CartItems({ 
      id: '1', 
      name: 'Product 1', 
      price: 10,
      quantity: 10,
      editable: true,
      productMedia: [],
      description: 'Product 1 description'
    });
    const newQuantity = 3;
  
    mockCartService.changeQuantity.and.returnValue(of({}));
  
    component.changeQuantity(mockCartItem, newQuantity.toString());
    flush();
  
    expect(mockCartService.changeQuantity).toHaveBeenCalledWith(
      mockCartItem.itemId,
      mockCartItem.product.id,
      newQuantity
    );
  }));*/
  
  it('should add seller info to each item in the order', fakeAsync(() => {
    const mockOrderData = { items: [{ seller_id: 'seller1' }, { seller_id: 'seller2' }] };
  
    const mockSellerInfo1 = { name: 'Seller 1', email: 'seller1@example.com' };
    const mockSellerInfo2 = { name: 'Seller 2', email: 'seller2@example.com' };
  
    mockUserService.getUserById.and.returnValues(of(mockSellerInfo1), of(mockSellerInfo2));
  
    component.getOrderDataWithSellerInfo(mockOrderData, (updatedOrderData) => {
      expect(updatedOrderData.items.length).toBe(2);
      expect(updatedOrderData.items[0].sellerInfo.name).toBe('Seller 1');
      expect(updatedOrderData.items[1].sellerInfo.email).toBe('seller2@example.com');
    });
    tick();
  }));
  

  /*it("should remove item from cart", fakeAsync(() => {
    const mockProduct: Product = {
      id: "1",
      name: "Product 1",
      price: 10,
      description: "Product 1 description",
      quantity: 10,
      editable: true,
      productMedia: [],
    };

    const mockCartItem: CartItems = new CartItems(mockProduct);

    mockCartService.removeCartItems;
    mockCartService.removeFromCart.and.returnValue(of({}));

    component.removeFromCart(mockCartItem);
    tick();

    expect(mockCartService.removeFromCart).toHaveBeenCalledWith(
      mockCartItem.itemId
    );
  }));*/

  it("should create order and navigate to home", fakeAsync(() => {
    const mockOrderId = "123";
    const mockOrderData = {
      order_status: "CREATED",
      payment_code: "CASH",
    };

    mockOrderService.createOrder.and.returnValue(of(mockOrderId));
    mockOrderService.getOrderByOrderId.and.returnValue(of({ items: [] }));
    const navigateSpy = spyOn(router, 'navigate');
    component.checkOut();
    flush(); 

    expect(mockOrderService.createOrder).toHaveBeenCalledWith(mockOrderData);
    expect(mockOrderService.getOrderByOrderId).toHaveBeenCalledWith(
      mockOrderId
    );
    expect(navigateSpy).toHaveBeenCalledWith(['home']);
  }));
});
