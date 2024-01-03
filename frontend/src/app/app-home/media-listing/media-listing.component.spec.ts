import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MediaService } from 'src/app/services/media.service';
import { ErrorService } from 'src/app/services/error.service';
import { MediaListingComponent } from './media-listing.component';
import { MediaComponent } from './media/media.component';
import { Observable } from 'rxjs';

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
    

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle error with status 403 for getImageByProductId', fakeAsync(() => {
    const mockProductId = '123';
  
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };
    spyOn(component, 'getProductImages').and.callThrough();

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
});
