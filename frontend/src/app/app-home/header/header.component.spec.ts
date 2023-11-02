import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { EncryptionService } from 'src/app/services/encryption.service';
import { ToastrService, ToastrModule } from 'ngx-toastr'; 
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: AuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        AuthenticationService,
        EncryptionService,
        ToastrService, 
        MatDialog
      ],
      imports: [
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatDialogModule,
        ToastrModule.forRoot() 
      ]
    });

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthenticationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should check if user is logged in', () => {
  //   expect(component.isLoggedIn).toBeFalse();
  //   authService.login();
  //   expect(component.isLoggedIn).toBeTrue();
  // });

  it('should get the user role', () => {
    // Test getting the user role, perhaps by simulating encrypted data in sessionStorage
    // Mock the required services to return expected data and test the role retrieval logic
  });

  it('should logout user', () => {
    // Test the logout functionality
    // Call the logout method and expect the user to be logged out (mock the necessary services)
  });

  it('should open create product modal', () => {
    // Test opening the create product modal
    // Expect the dialog to be opened when calling the openCreateProduct method
  });

  it('should throw out user on token expiration or corruption', () => {
    // Test throwing out the user
    // Simulate a token expiration or corruption and expect the user to be logged out
  });
});
