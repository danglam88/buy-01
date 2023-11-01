import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MediaService } from './media.service';

describe('MediaService', () => {
  let service: MediaService;
  let httpTestingController: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MediaService],
    });
    service = TestBed.inject(MediaService);
    
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get image by product ID', () => {
    const productId = "1";
    const imageIDs = ["1", "2"]; // Replace with your dummy data

    service.getImageByProductId(productId).subscribe((data) => {
      expect(data).toEqual(imageIDs);
    });

    const req = httpTestingController.expectOne('http://localhost:8082/media/product/' + productId);
    expect(req.request.method).toBe('GET');
  });

  it('should get image by media ID', () => {
    const mediaId = "1";
    const imageBlob = new Blob(); 

    service.getImageByMediaId(mediaId).subscribe((data) => {
      expect(data).toEqual(imageBlob);
    });

    const req = httpTestingController.expectOne('http://localhost:8082/media/' + mediaId);
    expect(req.request.method).toBe('GET');
  });

  it('should upload media', () => {
    const mediaForm = new FormData(); 
    const productId = "1";
    const mediaFile = new File([""], "filename"); 
    mediaForm.append('file', mediaFile);
    mediaForm.append('productId', productId);
    const response = null; 
    
    service.uploadMedia(mediaForm).subscribe((data) => {
      expect(data).toEqual(response);
    });

    const req = httpTestingController.expectOne('http://localhost:8082/media');
    expect(req.request.method).toBe('POST');
  });

  it('should delete media', () => {
    const mediaId = "1";
    const response = {}; // Replace with your dummy response

    service.deleteMedia(mediaId).subscribe((data) => {
      expect(data).toEqual(response);
    });

    const req = httpTestingController.expectOne('http://localhost:8082/media/' + mediaId);
    expect(req.request.method).toBe('DELETE');
  });
});
