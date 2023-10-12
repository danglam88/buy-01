import { TestBed } from '@angular/core/testing';

import { RegistratonService } from './registraton.service';

describe('RegistratonService', () => {
  let service: RegistratonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegistratonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
