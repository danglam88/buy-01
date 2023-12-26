import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { UserDashboardComponent } from './user-dashboard.component';
import { UserService } from 'src/app/services/user.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { HeaderComponent } from '../header/header.component';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { FooterComponent } from '../footer/footer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ErrorService } from 'src/app/services/error.service';
import { ValidationService } from 'src/app/services/validation.service';
import { Observable  } from 'rxjs';

describe('UserDashboardComponent', () => {
  let component: UserDashboardComponent;
  let fixture: ComponentFixture<UserDashboardComponent>;
  let errorService: ErrorService;
  let userService: UserService;

  beforeEach(() => {
    
    TestBed.configureTestingModule({
      declarations: [UserDashboardComponent, 
                    HeaderComponent,
                    FooterComponent],
      imports: [HttpClientTestingModule, 
                ToastrModule.forRoot(), 
                AngularMaterialModule,
                ReactiveFormsModule], 
      providers: [UserService, ValidationService, ErrorService],
    });
    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    fixture.detectChanges();
    errorService  = TestBed.inject(ErrorService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get user info',  fakeAsync(() => {
    spyOn(userService, 'getUserInfo').and.callThrough();
    component.getUserInfo();
    tick();
    expect(userService.getUserInfo).toHaveBeenCalled();
  }));

  it('should handle 403 error when getting user info',  fakeAsync(() => {
    
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };
    spyOn(userService, 'getUserInfo').and.returnValue(new Observable((observer) => {
      observer.error(errorResponse);
      observer.complete();
    }));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpirationError');

    component.getUserInfo();
    tick();
    
    expect(userService.getUserInfo).toHaveBeenCalled();
    expect(errorService.isAuthError).toHaveBeenCalledWith(403);
    expect(errorService.handleSessionExpirationError).toHaveBeenCalled();
  }));

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
