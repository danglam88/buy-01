import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegistrationService } from 'src/app/services/registration.service';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ValidationService } from 'src/app/services/validation.service';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { ErrorService } from 'src/app/services/error.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let toastrService: ToastrService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      providers: [
        RegistrationService,
        ToastrService,
        ValidationService,
        ErrorService
      ],
      imports: [
        FormsModule, 
        ReactiveFormsModule, 
        ToastrModule.forRoot(), 
        HttpClientTestingModule,
        AngularMaterialModule
      ]
    });
     fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    toastrService = TestBed.inject(ToastrService); 
    spyOn(toastrService, 'error'); 
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create registerform', () => {
    expect(component.registerform).toBeTruthy();
  });

  it('should display error for invalid name input', () => {
    component.registerform.controls['name'].setValue(''); 
    component.register();
    expect(toastrService.error).toHaveBeenCalledWith('Please enter a valid name (maximum 50 characters)');
  });

  it('should display error for invalid email input', () => {
    component.registerform.controls['name'].setValue('Ashley'); 
    component.registerform.controls['email'].setValue('invalidEmail'); 
    component.register();
    expect(toastrService.error).toHaveBeenCalledWith('Please enter a valid email');
  });

  it('should display error for invalid password input', () => {
    component.registerform.controls['name'].setValue('Ashley'); 
    component.registerform.controls['email'].setValue('ashley@gmail.com'); 
    component.registerform.controls['password'].setValue('weak'); 
    component.register();
    expect(toastrService.error).toHaveBeenCalledWith('Please enter a valid password (from 6 to 50 characters) which contains at least one uppercase letter, one lowercase letter, one digit and one special character (@$!%*?&)');
  });

  it('should display error for missing role selection', () => {
    component.registerform.controls['name'].setValue('Ashley'); 
    component.registerform.controls['email'].setValue('ashley@gmail.com'); 
    component.registerform.controls['password'].setValue('Ashley1234!'); 
    component.registerform.controls['role'].setValue(''); 
    component.register();
    expect(toastrService.error).toHaveBeenCalledWith('Please select a role');
  });

});
