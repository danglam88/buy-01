import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { RegistratonService } from './registraton.service';

describe('RegistratonService', () => {
  let service: RegistratonService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RegistratonService],
    });

    service = TestBed.inject(RegistratonService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a user', () => {
    const mockUser = { /* Provide mock user data here */ };

    service.register(mockUser).subscribe((data) => {
      expect(data).toEqual(mockUser);
    });

    const req = httpTestingController.expectOne('http://localhost:8080/reg');
    expect(req.request.method).toBe('POST');

    req.flush(mockUser);
  });
});
