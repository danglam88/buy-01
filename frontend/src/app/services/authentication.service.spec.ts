import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthenticationService]
    });

    // Inject the http service and test controller for each test
    authService = TestBed.inject(AuthenticationService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  // Verifies that there are no outstanding HTTP requests or expectations after each test
  afterEach(() => {
    httpTestingController.verify();
  });

  // AuthenticationService instance is created successfully
  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  it('should authenticate the user', () => {
    const mockUser = { username: 'testuser', password: 'testpassword' };
    const mockResponse = { token: 'mockToken' };

    authService.authenticate(mockUser).subscribe((response: any) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpTestingController.expectOne('http://localhost:8080/auth');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  // Initially, the loggedIn state in the service is false
  it('should return false for initial loggedIn state', () => {
    expect(authService.loggedIn).toBeFalse();
  });

  // The loggedIn state in the service is true after login
  it('should set loggedIn state to true after login', () => {
    authService.login();
    expect(authService.loggedIn).toBeTrue();
  });

  // The loggedIn state in the service is false after logout
  it('should set loggedIn state to false after logout', () => {
    authService.logout();
    expect(authService.loggedIn).toBeFalse();
  });

  // The isAuthenticated method returns the loggedIn state
  it('should return the logged in status asynchronously', (done: DoneFn) => {
    authService.login();
    authService.isAuthenticated().then((loggedIn: boolean) => {
      expect(loggedIn).toBeTrue();
      done();
    });
  });
});
