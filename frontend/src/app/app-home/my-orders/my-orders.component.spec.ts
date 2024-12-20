import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ToastrModule } from 'ngx-toastr';

import { MyOrdersComponent } from './my-orders.component';
import { SearchComponent } from '../search/search.component';
import { HeaderComponent } from '../header/header.component';
import { StatsComponent } from './stats/stats.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { FooterComponent } from '../footer/footer.component';
import { UserService } from 'src/app/services/user.service';

class MatDialogMock {
  open() {
    return {
      afterClosed: () => of(true), 
    };
  }
}

describe('MyOrdersComponent', () => {
  let component: MyOrdersComponent;
  let fixture: ComponentFixture<MyOrdersComponent>;
  let dialog: MatDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AngularMaterialModule, ToastrModule.forRoot()],
      providers: [
        UserService, 
        { provide: MatDialog, useClass: MatDialogMock },
      ],
      declarations: [MyOrdersComponent, HeaderComponent, FooterComponent, OrderHistoryComponent, StatsComponent, SearchComponent]
    });
    fixture = TestBed.createComponent(MyOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
