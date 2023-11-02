import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RegistratonService } from '../../services/registraton.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { ToastrModule } from 'ngx-toastr';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let regService: RegistratonService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      providers: [
        FormBuilder,
        { provide: ToastrService, useClass: ToastrServiceStub},
        RegistratonService,
        Router,
        ToastrService
      ],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        AngularMaterialModule,
        ToastrModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    regService = TestBed.inject(RegistratonService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  class ToastrServiceStub {
    success(message: string) {
      
    }
  
    error(message: string) {
      
    }
  
  }

  it('should create the RegisterComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should have initialized the form with the expected fields', () => {
    expect(component.registerform).toBeDefined();
    expect(component.registerform.get('name')).toBeDefined();
    expect(component.registerform.get('email')).toBeDefined();
    expect(component.registerform.get('password')).toBeDefined();
    expect(component.registerform.get('role')).toBeDefined();
  });

  it('should create a valid form', () => {
    const nameControl = component.registerform.get('name');
    nameControl.setValue('Ashley');

    const emailControl = component.registerform.get('email');
    emailControl.setValue('Ashley@gmail.com');

    const passwordControl = component.registerform.get('password');
    passwordControl.setValue('Ashley1234!');

    const roleControl = component.registerform.get('role');
    roleControl.setValue('Seller');

    expect(component.registerform.valid).toBeTruthy();
  });

  it('should call register() method and perform registration', () => {
    const spy = spyOn(regService, 'register').and.callThrough();

    component.registerform.setValue({
      name: 'Ashley',
      email: 'Ashley@gmail.com',
      password: 'Ashley1234!',
      role: 'Seller'
    });

    component.register();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });
});
