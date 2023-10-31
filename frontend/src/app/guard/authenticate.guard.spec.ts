import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { AuthenticateGuard } from './authenticate.guard';

describe('authenticateGuard', () => {
  const guard: AuthenticateGuard = TestBed.get(AuthenticateGuard);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthenticateGuard],
    });
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
