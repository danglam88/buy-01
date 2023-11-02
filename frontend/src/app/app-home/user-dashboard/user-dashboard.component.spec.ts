import { TestBed, ComponentFixture } from '@angular/core/testing';
import { UserDashboardComponent } from './user-dashboard.component';
import { UserService } from 'src/app/services/user.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { HeaderComponent } from '../header/header.component';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { FooterComponent } from '../footer/footer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ValidationService } from 'src/app/services/validation.service';

describe('UserDashboardComponent', () => {
  let component: UserDashboardComponent;
  let fixture: ComponentFixture<UserDashboardComponent>;
  let validationService: ValidationService;

  beforeEach(() => {
    let userService: UserService;
    TestBed.configureTestingModule({
      declarations: [UserDashboardComponent, 
                    HeaderComponent,
                    FooterComponent],
      imports: [HttpClientTestingModule, 
                ToastrModule.forRoot(), 
                AngularMaterialModule,
                ReactiveFormsModule], 
      providers: [UserService, ValidationService],
    });
    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    fixture.detectChanges();
    validationService = TestBed.inject(ValidationService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update user name', () => {
    const updatedName = 'Ashley'; 
    component.userProfileForm.patchValue({ name: updatedName });
    component.updateUserInformation('name');
    expect(component.userProfileForm.value.name).toEqual(updatedName);
  });
  
  it('should update user email', () => {
    const updatedEmail = 'Ashley@gmail.com'; 
    component.userProfileForm.patchValue({ email: updatedEmail });
    component.updateUserInformation('email');
    expect(component.userProfileForm.value.email).toEqual(updatedEmail);
  });

  it('should update user password', () => {
    const updatedPassword = 'Ashley1234!'; 
    component.userProfileForm.patchValue({ password: updatedPassword });
    component.updateUserInformation('password');
    expect(component.userProfileForm.value.password).toEqual(updatedPassword);
  });

  it('should update user avatar', () => {
    const updatedAvatar = undefined; 
    component.userProfileForm.patchValue({ avatar: updatedAvatar });
    component.updateUserInformation('avatar');
    expect(component.userProfileForm.value.avatar).toEqual(updatedAvatar); 
  });
});
