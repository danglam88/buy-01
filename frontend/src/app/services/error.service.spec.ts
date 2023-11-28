import { TestBed } from '@angular/core/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing'; 
import { Router } from '@angular/router';
import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let toastrService: ToastrService;
  let errorService: ErrorService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), RouterTestingModule], // Add RouterTestingModule
      providers: [
        ErrorService,
        ToastrService,
      ],
    });
   router = TestBed.inject(Router);
    errorService = TestBed.inject(ErrorService);
    toastrService = TestBed.inject(ToastrService); // Initialize toastrService
    spyOn(toastrService, 'error').and.stub(); // Use and.stub() to prevent actual method calls
  });

  it('should be created', () => {
    expect(errorService).toBeTruthy();
  });

  it('should handle session expiration error', () => {
    
    spyOn(router, 'navigate');

    errorService.handleSessionExpirationError();

    expect(toastrService.error).toHaveBeenCalledWith('Session expired. Log-in again.');
    expect(router.navigate).toHaveBeenCalledWith(['../login']);
  });

  it('should handle bad request error with specific error messages', () => {
    const error = {
      status: 400,
      error: {
        message: 'Bad request error message',
      },
    };

    errorService.handleBadRequestError(error);

    expect(toastrService.error).toHaveBeenCalledWith('Bad request error message');
  });

  it('should handle bad request error with array of error messages', () => {
    const error = {
      status: 400,
      error: ['Error message 1', 'Error message 2'],
    };

    errorService.handleBadRequestError(error);

    expect(toastrService.error).toHaveBeenCalledWith('Error message 1');
  });

  it('should handle bad request error with generic message', () => {
    const error = {
      status: 400,
      error: {},
    };

    errorService.handleBadRequestError(error);

    expect(toastrService.error).toHaveBeenCalledWith('Something went wrong');
  });
});
