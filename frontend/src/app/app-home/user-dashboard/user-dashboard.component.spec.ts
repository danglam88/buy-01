import { TestBed, ComponentFixture } from '@angular/core/testing';
import { UserDashboardComponent } from './user-dashboard.component';
import { UserService } from 'src/app/services/user.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { HeaderComponent } from '../header/header.component';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { FooterComponent } from '../footer/footer.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('UserDashboardComponent', () => {
  let component: UserDashboardComponent;
  let fixture: ComponentFixture<UserDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserDashboardComponent, 
                    HeaderComponent,
                    FooterComponent],
      imports: [HttpClientTestingModule, 
                ToastrModule.forRoot(), 
                AngularMaterialModule,
                ReactiveFormsModule], 
      providers: [UserService],
    });
    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
