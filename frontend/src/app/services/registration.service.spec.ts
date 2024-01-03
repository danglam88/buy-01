import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { RegistrationService } from './registration.service';
import { environment } from '../../environments/environment';

describe('RegistrationService', () => {
  let registrationService: RegistrationService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegistrationService],
    });

    registrationService = TestBed.inject(RegistrationService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(registrationService).toBeTruthy();
  });

  it('should register a user', () => {
    const mockUser = { /* Provide mock user data here */ };

    registrationService.register(mockUser).subscribe((data) => {
      expect(data).toEqual(mockUser);
    });

    const req = httpTestingController.expectOne(`${environment.regUrl}`);
    expect(req.request.method).toBe('POST');

    req.flush(mockUser);
  });
});
