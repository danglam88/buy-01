import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { UserService } from './user.service';
import { EncryptionService } from '../services/encryption.service';
import { environment } from '../../environments/environment';


describe('UserService', () => {
  let userService: UserService;
  let httpTestingController: HttpTestingController;
  let router: Router;
  let encryptionService: EncryptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService, EncryptionService],
    });

    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
    encryptionService = TestBed.inject(EncryptionService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(userService).toBeTruthy();
  });

  it('should return the token when it is valid', () => {
    const encryptedSecret = 'str';
    const decryptedSecret = JSON.stringify({ token: 'mockedToken' });
      
    spyOn(localStorage, 'getItem').and.returnValue(encryptedSecret);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate'); 

    spyOn(encryptionService, 'decrypt').and.returnValue(decryptedSecret);
  
    const token = userService.token;
  
    expect(token).toBe('mockedToken');
    expect(navigateSpy).not.toHaveBeenCalled();
  });
 
  it('should navigate to login when the secret is invalid', () => {
    const encryptedSecret = 'str';
  
    spyOn(localStorage, 'getItem').and.returnValue(encryptedSecret);
  
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate'); 
  
    spyOn(encryptionService, 'decrypt').and.throwError('Invalid decryption');
  
    const token = userService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['login']);
  });
  
  it('should navigate to login when the secret is invalid', () => {
    const encryptedSecret = 'str';
  
    spyOn(localStorage, 'getItem').and.returnValue(encryptedSecret);
    spyOn(encryptionService, 'decrypt').and.throwError('Invalid decryption');
  
    const navigateSpy = spyOn(router, 'navigate'); 
  
    const token = userService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['login']);
  });
  
  it('should return an empty string when no token is available', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(encryptionService, 'decrypt'); 
    const navigateSpy = spyOn(router, 'navigate'); 
    const token = userService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

   it('should get user information', () => {
    const mockUserInfo = {  };

    userService.getUserInfo().subscribe((userInfo) => {
      expect(userInfo).toEqual(mockUserInfo);
    });

    const req = httpTestingController.expectOne(`${environment.userInfoUrl}`);
    expect(req.request.method).toBe('GET');

    req.flush(mockUserInfo);
  });

  it('should update a user', () => {
    const mockUser = {  };
    const userId = '123'; 

    userService.updateUser(mockUser, userId).subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpTestingController.expectOne(`${environment.userUrl}` + userId);
    expect(req.request.method).toBe('PUT');

    req.flush({});
  });

  it('should delete a user', () => {
    const mockUser = {
      id: '123',
    }

    userService.deleteUser(mockUser).subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpTestingController.expectOne(`${environment.userUrl}` + mockUser.id);
    expect(req.request.method).toBe('DELETE');

    req.flush({});
  });

  it('should retrieve a user avatar', () => {
    const userId = '123'; 

    userService.getUserAvatar(userId).subscribe((avatarBlob) => {
      expect(avatarBlob).toBeTruthy();
    });

    const req = httpTestingController.expectOne(`${environment.avatarUserUrl}` + userId);
    expect(req.request.method).toBe('GET');

    const blob = new Blob([]);
    req.flush(blob);
  });
});
