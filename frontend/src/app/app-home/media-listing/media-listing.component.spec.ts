import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MediaService } from 'src/app/services/media.service';
import { ErrorService } from 'src/app/services/error.service';
import { MediaListingComponent } from './media-listing.component';
import { MediaComponent } from './media/media.component';
import { of, Observable } from 'rxjs';

class ToastrServiceStub {
  error(message: string) {
    // Do nothing in the stub
  }
  success(message: string) {
    // Do nothing in the stub
  }
}

describe('MediaListingComponent', () => {
  let component: MediaListingComponent;
  let fixture: ComponentFixture<MediaListingComponent>;
  let mediaService: jasmine.SpyObj<MediaService>;
  let errorService: ErrorService;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('MediaService', ['getImageByProductId', 'getImageByMediaId']);
    TestBed.configureTestingModule({
      declarations: [MediaListingComponent, MediaComponent],
      providers: [
        { provide: MediaService, useValue: spy },
        { provide: ToastrService, useClass: ToastrServiceStub },
      ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ToastrModule.forRoot(),
      ],
    });

    fixture = TestBed.createComponent(MediaListingComponent);
    component = fixture.componentInstance;
    mediaService = TestBed.inject(MediaService) as jasmine.SpyObj<MediaService>;

    errorService = TestBed.inject(ErrorService);
    spyOn(component, 'ngOnInit').and.callThrough();
    spyOn(component, 'getProductImages').and.callThrough();
    spyOn(mediaService, 'getImageByMediaId').and.returnValue(of(new Blob()));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getProductImages() and retrive product images', fakeAsync(() => {
    const mockProductId = '123'; 
    const mockProducMediaIDs = ['1', '2'];
    const mockProductMediaData = new Blob([''], { type: 'image/jpeg' });
    const mockProductImageResult = [mockProductMediaData, mockProductMediaData];
    
    mediaService.getImageByProductId.and.returnValue(of(mockProducMediaIDs));
    mediaService.getImageByMediaId.and.returnValue(of(mockProductImageResult[0]));

    component.getProductImages(mockProductId);

    tick();

    expect(component.getProductImages).toHaveBeenCalledWith(mockProductId);
    expect(mediaService.getImageByProductId).toHaveBeenCalledWith(mockProductId);
    expect(mediaService.getImageByMediaId).toHaveBeenCalledWith(mockProductImageResult[0]);
  
    component.mediaImageData$.subscribe((data) => {
      expect(data).toBeTruthy();
    });
  }));

  it('should handle error with status 403 for getImageByProductId', fakeAsync(() => {
    const mockProductId = '123';
  
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };

    mediaService.getImageByProductId.and.returnValue(new Observable((observer) => {
      observer.error(errorResponse);
      observer.complete();
    }));
    mediaService.getImageByMediaId.and.returnValue(new Observable((observer) => {
      observer.error(errorResponse);
      observer.complete();
    }));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpirationError');

    
    component.getProductImages(mockProductId);
    tick(250);

    expect(component.getProductImages).toHaveBeenCalledWith(mockProductId);
    component.mediaImageData$.subscribe((data) => {
      expect(mediaService.getImageByProductId).toHaveBeenCalledWith(mockProductId);
      expect(mediaService.getImageByMediaId).not.toHaveBeenCalled();
      expect(errorService.isAuthError).toHaveBeenCalledWith(403);
      expect(errorService.handleSessionExpirationError).toHaveBeenCalled();
    });
  }));

  
  it('should call getProductImages() when mediaDeleted is emitted', () => {
    spyOn(mediaService.mediaDeleted, 'subscribe').and.callThrough(); 
    mediaService.mediaDeleted.emit(true);

    expect(component.getProductImages).toHaveBeenCalled();
  });

  it('should call getProductImages() when mediaUpload is emitted', () => {
    spyOn(mediaService.mediaUpload, 'subscribe').and.callThrough(); 
    mediaService.mediaUpload.emit(true);

    expect(component.getProductImages).toHaveBeenCalled();
  });
});
