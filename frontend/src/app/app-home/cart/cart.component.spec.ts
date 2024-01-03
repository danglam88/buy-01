import {
  ComponentFixture,
  TestBed,
  tick,
  fakeAsync,
  flush,
} from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { MatDialog } from "@angular/material/dialog";
import { of } from "rxjs";
import { Router } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";

import { CartComponent } from "./cart.component";
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { OrderDetailsComponent } from "../my-orders/order-details/order-details.component";

import { CartService } from "src/app/services/cart.service";
import { OrderService } from "src/app/services/order.service";
import { UserService } from "src/app/services/user.service";
import { ToastrService } from "ngx-toastr";

describe("CartComponent", () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let router: Router;

  let mockCartService: jasmine.SpyObj<CartService>;
  let mockOrderService: jasmine.SpyObj<OrderService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockMatDialog: jasmine.SpyObj<MatDialog>;
  mockMatDialog = jasmine.createSpyObj<MatDialog>("MatDialog", ["open"]);
  const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true) });
  mockMatDialog.open.and.returnValue(dialogRefSpyObj);
  let mockToastrService: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    mockCartService = jasmine.createSpyObj("CartService", [
      "getCart",
      "changeQuantity",
      "removeFromCart",
      "isItemAddedToCart",
      "removeCartItems",
      "clearCart",
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
      declarations: [
        CartComponent,
        HeaderComponent,
        FooterComponent,
        OrderDetailsComponent,
      ],
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

  it("should set cart items using setCart method", fakeAsync(() => {
    const mockCartData = [
      {
        product: { id: "1", name: "Product 1", price: 10 },
        quantity: 2,
        item_price: 20,
        itemId: "123",
      },
    ];

    mockCartService.getCart.and.returnValue(of(mockCartData));

    component.setCart();
    tick();

    expect(component.cart.items.length).toBe(1);
    expect(component.cart.items[0].product.id).toBe("1");
  }));

  it("should return an array of numbers up to the given quantity", () => {
    const quantity = 5;
    const result = component.getQuantityOptions(quantity);

    expect(result.length).toBe(quantity);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it("should create order and navigate to home", fakeAsync(() => {
    const mockOrderId = "123";
    const mockOrderData = {
      order_status: "CREATED",
      payment_code: "CASH",
    };

    mockOrderService.createOrder.and.returnValue(of(mockOrderId));
    mockOrderService.getOrderByOrderId.and.returnValue(of({ items: [] }));
    const navigateSpy = spyOn(router, "navigate");
    component.checkOut();
    flush();

    expect(mockOrderService.createOrder).toHaveBeenCalledWith(mockOrderData);
    expect(mockOrderService.getOrderByOrderId).toHaveBeenCalledWith(
      mockOrderId
    );
    expect(navigateSpy).toHaveBeenCalledWith(["home"]);
  }));

  it("should return an empty array if quantity is 0", () => {
    const quantity = 0;
    const result = component.getQuantityOptions(quantity);
    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });

  it("should return an array of numbers up to the given quantity", () => {
    const quantity = 5;
    const result = component.getQuantityOptions(quantity);
    expect(result.length).toBe(quantity);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });
});
