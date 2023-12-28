import { ComponentFixture, TestBed } from '@angular/core/testing';
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

class ToastrServiceStub {
  error(message: string) {}
  success(message: string) {}
}

describe('OrderHistoryComponent', () => {
  let component: OrderHistoryComponent;
  let fixture: ComponentFixture<OrderHistoryComponent>;

  beforeEach(() => {
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
      ],
      imports: [AngularMaterialModule, HttpClientTestingModule]
    });
    fixture = TestBed.createComponent(OrderHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
