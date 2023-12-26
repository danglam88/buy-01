import {
  ComponentFixture,
  TestBed,
  tick,
  fakeAsync,
} from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { MatDialog } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { of } from "rxjs";
import { CartComponent } from "./cart.component";
import { CartService } from "src/app/services/cart.service";
import { OrderService } from "src/app/services/order.service";
import { UserService } from "src/app/services/user.service";
import { OrderDetailsComponent } from "../my-account/order-details/order-details.component";
import { Cart } from "src/app/Models/Cart";
import { CartItems } from "src/app/Models/CartItems";
import { Product } from "src/app/Models/Product";

describe("CartComponent", () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;

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
      declarations: [CartComponent],
      imports: [RouterTestingModule],
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
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should set cart items on initialization", fakeAsync(() => {
    const mockProduct1: Product = {
      id: "1",
      name: "Product 1",
      price: 10,
      description: "Product 1 description",
      quantity: 10,
      editable: true,
      productMedia: [],
    };

    const mockProduct2: Product = {
      id: "2",
      name: "Product 2",
      price: 20,
      description: "Product 2 description",
      quantity: 20,
      editable: true,
      productMedia: [],
    };

    const mockCart: Cart = {
      items: [new CartItems(mockProduct1), new CartItems(mockProduct2)],
    };

    mockCartService.getCart.and.returnValue(of(mockCart));

    component.ngOnInit();
    tick();

    expect(component.cart.items.length).toBe(2);
  }));

  it("should change quantity and update cart", fakeAsync(() => {
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
    const newQuantity = 3;

    mockCartService.changeQuantity.and.returnValue(of({}));

    component.changeQuantity(mockCartItem, newQuantity.toString());
    tick();

    expect(mockCartService.changeQuantity).toHaveBeenCalledWith(
      mockCartItem.itemId,
      mockCartItem.product.id,
      newQuantity
    );
  }));

  it("should remove item from cart", fakeAsync(() => {
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

    mockCartService.removeFromCart.and.returnValue(of({}));

    component.removeFromCart(mockCartItem);
    tick();

    expect(mockCartService.removeFromCart).toHaveBeenCalledWith(
      mockCartItem.itemId
    );
  }));

  it("should create order and navigate to home on checkout", fakeAsync(() => {
    const mockOrderId = "123";
    const mockOrderData = {
      order_status: "CREATED",
      payment_code: "CASH",
    };

    mockOrderService.createOrder.and.returnValue(of(mockOrderId));
    mockOrderService.getOrderByOrderId.and.returnValue(of({ items: [] }));

    component.checkOut();
    tick();

    expect(mockOrderService.createOrder).toHaveBeenCalledWith(mockOrderData);
    expect(mockOrderService.getOrderByOrderId).toHaveBeenCalledWith(
      mockOrderId
    );
  }));
});
