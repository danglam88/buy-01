import { TestBed } from '@angular/core/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ErrorService } from './error.service';
import { AuthenticationService } from './authentication.service';

describe('ErrorService', () => {
  let toastrService: ToastrService;
  let errorService: ErrorService;
  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot(), HttpClientTestingModule], 
      providers: [
        ErrorService,
        ToastrService,
        AuthenticationService
      ],
    });

    errorService = TestBed.inject(ErrorService);
    toastrService = TestBed.inject(ToastrService); 
    spyOn(toastrService, 'error').and.stub(); 
  });

  it('should be created', () => {
    expect(errorService).toBeTruthy();
  });

  it('should handle session expiration error', () => {
    errorService.handleSessionExpirationError();
    expect(toastrService.error).toHaveBeenCalledWith('Session expired. Log-in again.');
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
