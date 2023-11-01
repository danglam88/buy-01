import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { EncryptionService } from '../services/encryption.service';

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService, EncryptionService],
    });

    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve user information', () => {
    const mockUserInfo = { /* Provide mock user info here */ };

    service.getUserInfo().subscribe((userInfo) => {
      expect(userInfo).toEqual(mockUserInfo);
    });

    const req = httpTestingController.expectOne('http://localhost:8080/users/userInfo');
    expect(req.request.method).toBe('GET');

    req.flush(mockUserInfo);
  });

  it('should update a user', () => {
    const mockUser = { /* Provide mock user data here */ };
    const userId = '123'; // Replace with an actual user ID

    service.updateUser(mockUser, userId).subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpTestingController.expectOne('http://localhost:8080/users/' + userId);
    expect(req.request.method).toBe('PUT');

    req.flush({});
  });

  it('should delete a user', () => {
    const mockUser = {
      id: '123',
    }

    service.deleteUser(mockUser).subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpTestingController.expectOne('http://localhost:8080/users/' + mockUser.id);
    expect(req.request.method).toBe('DELETE');

    req.flush({});
  });

  it('should retrieve a user avatar', () => {
    const userId = '123'; // Replace with an actual user ID

    service.getUserAvatar(userId).subscribe((avatarBlob) => {
      expect(avatarBlob).toBeTruthy();
    });

    const req = httpTestingController.expectOne('http://localhost:8080/users/avatar/' + userId);
    expect(req.request.method).toBe('GET');

    // Provide a mock blob as the response
    const blob = new Blob([/* Provide binary data here */]);
    req.flush(blob);
  });
});
