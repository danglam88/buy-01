import { TestBed } from '@angular/core/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ErrorService } from './error.service';
import { Router } from '@angular/router';

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
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot()],
      providers: [
        ErrorService,
        { provide: ToastrService, useClass: ToastrServiceStub },
      ],
    });
   
    errorService = TestBed.inject(ErrorService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(errorService).toBeTruthy();
  });
});
