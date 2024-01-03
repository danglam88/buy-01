import {
  ComponentFixture,
  TestBed,
  tick,
  fakeAsync,
} from "@angular/core/testing";
import {
  MatDialog,
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from "@angular/material/dialog";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of, throwError } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";

import { OrderDetailsComponent } from "./order-details.component";
import { ConfirmationDialogComponent } from "../../confirmation-dialog/confirmation-dialog.component";
import { OrderService } from "src/app/services/order.service";
import { CartService } from "src/app/services/cart.service";
import { OrderItemService } from "src/app/services/order-item.service";
import { UserService } from "src/app/services/user.service"; // Import the UserService

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of(true),
    };
  }
}

class ToastrServiceStub {
  error(message: string) {}
  success(message: string) {}
}

describe("OrderDetailsComponent", () => {
  let component: OrderDetailsComponent;
  let fixture: ComponentFixture<OrderDetailsComponent>;
  let toastrService: ToastrService;
  let orderItemService: OrderItemService;
  let cartService: CartService;

  const mockDialogRef = {
    open: jasmine.createSpy("open"),
    close: jasmine.createSpy("close"),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderService,
        CartService,
        OrderItemService,
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MatDialog, useClass: MatDialogMock },
        { provide: ToastrService, useClass: ToastrServiceStub },
      ],
      declarations: [OrderDetailsComponent, ConfirmationDialogComponent],
      imports: [
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule,
      ],
    });
    fixture = TestBed.createComponent(OrderDetailsComponent);
    component = fixture.componentInstance;
    toastrService = TestBed.inject(ToastrService);
    orderItemService = TestBed.inject(OrderItemService);
    cartService = TestBed.inject(CartService);
    fixture.detectChanges();
  });

  it("should calculate totalSum for SELLER role", () => {
    component.dialogData = {
      role: "SELLER",
      order: { item_price: 15, quantity: 3 },
    };
    component.ngOnInit();
    expect(component.totalSum).toEqual(45);
  });

  it("should calculate totalSum for CLIENT role", () => {
    const order = {
      role: "CLIENT",
      order: {
        items: [
          { item_price: 10, quantity: 2 },
          { item_price: 10, quantity: 1 },
          { item_price: 10, quantity: 3 },
        ],
      },
    };
    component.dialogData = order;
    component.ngOnInit();
    expect(component.totalSum).toEqual(60);
  });

  it("should get order data with seller info", () => {
    const mockOrderData = {
      items: [{ seller_id: 1 }, { seller_id: 2 }],
    };
    const userService = TestBed.inject(UserService);

    spyOn(userService, "getUserById").and.returnValue(
      of({ name: "Seller 1", email: "seller1@example.com" })
    );

    component.getOrderDataWithSellerInfo(mockOrderData, (updatedOrderData) => {
      expect(updatedOrderData.items.length).toEqual(2);
      expect(updatedOrderData.items[0].sellerInfo.name).toEqual("Seller 1");
      expect(updatedOrderData.items[0].sellerInfo.email).toEqual(
        "seller1@example.com"
      );
    });
  });
  
});
