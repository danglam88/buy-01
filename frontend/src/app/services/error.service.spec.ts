import { TestBed } from '@angular/core/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ErrorService } from './error.service';

class ToastrServiceStub {
  error(message: string) {
    // Do nothing in the stub
  }
  success(message: string) {
    // Do nothing in the stub
  }
}

describe('ErrorService', () => {
  let toastrService: ToastrService;
  let errorService: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot()],
      providers: [
        ErrorService,
        { provide: ToastrService, useClass: ToastrServiceStub },
      ],
    });
   
    errorService = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(errorService).toBeTruthy();
  });

  it('should handle session expiration error', () => {
    spyOn(errorService['toastr'], 'error');
    spyOn(errorService['router'], 'navigate');

    errorService.handleSessionExpirationError();

    expect(errorService['toastr'].error).toHaveBeenCalledWith('Session expired. Log-in again.');
    expect(errorService['router'].navigate).toHaveBeenCalledWith(['../login']);
  });

  it('should handle bad request error with specific error messages', () => {
    spyOn(errorService['toastr'], 'error');

    const error = {
      status: 400,
      error: {
        message: 'Bad request error message',
      },
    };

    errorService.handleBadRequestError(error);

    expect(errorService['toastr'].error).toHaveBeenCalledWith('Bad request error message');
  });

  it('should handle bad request error with array of error messages', () => {
    spyOn(errorService['toastr'], 'error');

    const error = {
      status: 400,
      error: ['Error message 1', 'Error message 2'],
    };

    errorService.handleBadRequestError(error);

    expect(errorService['toastr'].error).toHaveBeenCalledWith('Error message 1');
  });

  it('should handle bad request error with generic message', () => {
    spyOn(errorService['toastr'], 'error');

    const error = {
      status: 400,
      error: {},
    };

    errorService.handleBadRequestError(error);

    expect(errorService['toastr'].error).toHaveBeenCalledWith('Something went wrong');
  });
});


