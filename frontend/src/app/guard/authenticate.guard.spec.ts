import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthenticateGuard } from './authenticate.guard';
import { AuthenticationService } from '../services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../services/encryption.service';

describe('AuthenticateGuard', () => {
  let guard: AuthenticateGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthenticateGuard,
        AuthenticationService,
        EncryptionService,
        {
          provide: ToastrService,
          useValue: {
            // mock necessary methods here if required
          }
        }
      ],
    });

    guard = TestBed.inject(AuthenticateGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
