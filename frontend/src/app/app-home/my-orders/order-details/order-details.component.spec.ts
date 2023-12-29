import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { AngularMaterialModule } from 'src/app/angular-material.module';

import { OrderDetailsComponent } from './order-details.component';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { OrderService } from 'src/app/services/order.service';
import { CartService } from 'src/app/services/cart.service';
import { OrderItemService } from 'src/app/services/order-item.service';

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

describe('OrderDetailsComponent', () => {
  let component: OrderDetailsComponent;
  let fixture: ComponentFixture<OrderDetailsComponent>;
  let toastrService: ToastrService;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close'),
  };


  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OrderService, 
        CartService, 
        OrderItemService, 
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MatDialog, useClass: MatDialogMock},
        { provide: ToastrService, useClass: ToastrServiceStub },
      ],
      declarations: [OrderDetailsComponent, ConfirmationDialogComponent],
      imports: [HttpClientTestingModule, AngularMaterialModule],

    });
    fixture = TestBed.createComponent(OrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
