import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MediaService } from 'src/app/services/media.service';
import { ErrorService } from 'src/app/services/error.service';
import { MediaListingComponent } from './media-listing.component';
import { MediaComponent } from './media/media.component';
import { of, throwError } from 'rxjs';

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
  let mediaService: MediaService;
  let errorService: ErrorService;
  let router: Router;
  let toastrService: ToastrService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MediaListingComponent, MediaComponent],
      providers: [
        MediaService,
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
    mediaService = TestBed.inject(MediaService);
    toastrService = TestBed.inject(ToastrService);
    errorService = TestBed.inject(ErrorService);
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getProductMedia and display product images', fakeAsync(() => {
    spyOn(component, 'getProductMedia').and.callThrough();
    spyOn(mediaService, 'getImageByProductId').and.returnValue(of({ success: true }));
    spyOn(mediaService, 'getImageByMediaId').and.returnValue(of(new Blob()));
    component.productId = '123';
    component.getProductMedia(component.productId);

    tick(250);

    expect(component.getProductMedia).toHaveBeenCalled();
    expect(mediaService.getImageByProductId).toHaveBeenCalled();
    expect(mediaService.getImageByMediaId).toHaveBeenCalled();
  }));

  it('should handle error with status 403 for getImageByProductId', fakeAsync(() => {
    spyOn(component, 'getProductMedia').and.callThrough();
  
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };

    spyOn(mediaService, 'getImageByProductId').and.returnValue(throwError(errorResponse));
    spyOn(mediaService, 'getImageByMediaId').and.returnValue(throwError(errorResponse));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpiration');

    component.productId = '123';
    component.getProductMedia(component.productId);
    tick(250);

    expect(component.getProductMedia).toHaveBeenCalled();
    expect(mediaService.getImageByProductId).toHaveBeenCalledWith(component.productId);
    expect(mediaService.getImageByMediaId).not.toHaveBeenCalled();
    expect(errorService.isAuthError).toHaveBeenCalledWith(403);
    expect(errorService.handleSessionExpiration).toHaveBeenCalled();
  }));

  it('should handle error with status 401 for getImageByProductId', fakeAsync(() => {
    spyOn(component, 'getProductMedia').and.callThrough();
  
    const errorResponse = {
      status: 401,
      error: 'Unauthorized',
    };

    spyOn(mediaService, 'getImageByProductId').and.returnValue(throwError(errorResponse));
    spyOn(mediaService, 'getImageByMediaId').and.returnValue(throwError(errorResponse));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpiration');

    component.productId = '123';
    component.getProductMedia(component.productId);
    tick(250);

    expect(component.getProductMedia).toHaveBeenCalled();
    expect(mediaService.getImageByProductId).toHaveBeenCalledWith(component.productId);
    expect(mediaService.getImageByMediaId).not.toHaveBeenCalled();
    expect(errorService.isAuthError).toHaveBeenCalledWith(401);
    expect(errorService.handleSessionExpiration).toHaveBeenCalled();
  }));

  it('should handle error with status 403 for getImageByMediaId', fakeAsync(() => {
    spyOn(component, 'getProductMedia').and.callThrough();
  
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };

    spyOn(mediaService, 'getImageByProductId').and.returnValue(throwError(errorResponse));
    spyOn(mediaService, 'getImageByMediaId').and.returnValue(throwError(errorResponse));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpiration');

    component.productId = '123';
    component.getProductMedia(component.productId);
    tick(250);

    expect(component.getProductMedia).toHaveBeenCalled();
    expect(mediaService.getImageByProductId).toHaveBeenCalled();
    expect(mediaService.getImageByMediaId).not.toHaveBeenCalledWith(component.getProductMedia);
    expect(errorService.isAuthError).toHaveBeenCalledWith(403);
    expect(errorService.handleSessionExpiration).toHaveBeenCalled();
  }));

  it('should handle error with status 401 for getImageByMediaId', fakeAsync(() => {
    spyOn(component, 'getProductMedia').and.callThrough();
  
    const errorResponse = {
      status: 401,
      error: 'Unauthorized',
    };

    spyOn(mediaService, 'getImageByProductId').and.returnValue(throwError(errorResponse));
    spyOn(mediaService, 'getImageByMediaId').and.returnValue(throwError(errorResponse));
    spyOn(errorService, 'isAuthError').and.returnValue(true); 
    spyOn(errorService, 'handleSessionExpiration');

    component.productId = '123';
    component.getProductMedia(component.productId);
    tick(250);

    expect(component.getProductMedia).toHaveBeenCalled();
    expect(mediaService.getImageByProductId).toHaveBeenCalled();
    expect(mediaService.getImageByMediaId).not.toHaveBeenCalledWith(component.getProductMedia);
    expect(errorService.isAuthError).toHaveBeenCalledWith(401);
    expect(errorService.handleSessionExpiration).toHaveBeenCalled();
  }));
  
  it('should call getProductMedia() when deleteProduct is emitted', () => {
    spyOn(component, 'getProductMedia');
    const deleteMediaEventSpy = spyOn(mediaService.productMediaDeleted, 'subscribe');

    deleteMediaEventSpy.and.callThrough(); // Just pass the callback through

    mediaService.productMediaDeleted.emit(true);

    expect(component.getProductMedia).toHaveBeenCalled();
  });
});
