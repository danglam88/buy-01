import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

import { MediaService } from './media.service';
import { EncryptionService } from '../services/encryption.service';

describe('MediaService', () => {
  let mediaService: MediaService;
  let router: Router;
  let encryptionService: EncryptionService;
  let httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MediaService, EncryptionService],
    });
    mediaService = TestBed.inject(MediaService);
    encryptionService = TestBed.inject(EncryptionService);
    router = TestBed.inject(Router);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(mediaService).toBeTruthy();
  });

  it('should return the token when it is valid', () => {
    const encryptedSecret = 'str';
    const decryptedSecret = JSON.stringify({ token: 'mockedToken' });
      
    spyOn(localStorage, 'getItem').and.returnValue(encryptedSecret);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate'); 

    spyOn(encryptionService, 'decrypt').and.returnValue(decryptedSecret);
  
    const token = mediaService.token;
  
    expect(token).toBe('mockedToken');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should navigate to login when the secret is invalid', () => {
    const encryptedSecret = 'str';
  
    spyOn(localStorage, 'getItem').and.returnValue(encryptedSecret);
  
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate'); 
    spyOn(encryptionService, 'decrypt').and.throwError('Invalid decryption');
  
    const token = mediaService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['../login']);
  });
  
  it('should navigate to login when the secret is invalid', () => {
    const encryptedSecret = 'str';
  
    spyOn(localStorage, 'getItem').and.returnValue(encryptedSecret);
    spyOn(encryptionService, 'decrypt').and.throwError('Invalid decryption');
  
    const navigateSpy = spyOn(router, 'navigate'); 
  
    const token = mediaService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).toHaveBeenCalledWith(['../login']);
  });
  
  it('should return an empty string when no token is available', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(encryptionService, 'decrypt'); 
    const navigateSpy = spyOn(router, 'navigate'); 
  
    const token = mediaService.token;
  
    expect(token).toBe('');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should get image by product ID', () => {
    const productId = "1";
    const imageIDs = ["1", "2"]; 

    mediaService.getImageByProductId(productId).subscribe((data) => {
      expect(data).toEqual(imageIDs);
    });

    const req = httpTestingController.expectOne(`${environment.productMediaUrl}` + productId);
    expect(req.request.method).toBe('GET');
  });

  it('should get image by media ID', () => {
    const mediaId = "1";
    const imageBlob = new Blob(); 

    mediaService.getImageByMediaId(mediaId).subscribe((data) => {
      expect(data).toEqual(imageBlob);
    });

    const req = httpTestingController.expectOne(`${environment.mediaUrl}/` + mediaId);
    expect(req.request.method).toBe('GET');
  });

  it('should upload media', () => {
    const mediaForm = new FormData(); 
    const productId = "1";
    const mediaFile = new File([""], "filename"); 
    mediaForm.append('file', mediaFile);
    mediaForm.append('productId', productId);
    const response = null; 
    
    mediaService.uploadMedia(mediaForm).subscribe((data) => {
      expect(data).toEqual(response);
    });

    const req = httpTestingController.expectOne(`${environment.mediaUrl}`);
    expect(req.request.method).toBe('POST');
  });

  it('should delete media', () => {
    const mediaId = "1";
    const response = {}; // Replace with your dummy response

    mediaService.deleteMedia(mediaId).subscribe((data) => {
      expect(data).toEqual(response);
    });

    const req = httpTestingController.expectOne(`${environment.mediaUrl}/` + mediaId);
    expect(req.request.method).toBe('DELETE');
  });
});
