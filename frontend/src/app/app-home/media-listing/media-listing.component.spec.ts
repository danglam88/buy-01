import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MediaService } from 'src/app/services/media.service';
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

  it('should handle error with status 403 or 401 for getImageByProductId', fakeAsync(() => {
    spyOn(component, 'getProductMedia').and.callThrough();
  
    const errorResponse = {
      status: 403,
      error: 'Forbidden',
    };

    spyOn(mediaService, 'getImageByProductId').and.returnValue(throwError(errorResponse));
    spyOn(mediaService, 'getImageByMediaId').and.returnValue(throwError(errorResponse));
    spyOn(toastrService, 'error');
    spyOn(router, 'navigate');

    component.productId = '123';
    component.getProductMedia(component.productId);
    tick(250);

    expect(component.getProductMedia).toHaveBeenCalled();
    expect(mediaService.getImageByProductId).toHaveBeenCalled();
    expect(mediaService.getImageByMediaId).not.toHaveBeenCalled();
    expect(toastrService.error).toHaveBeenCalledWith('Session expired. Log-in again.');
    expect(router.navigate).toHaveBeenCalledWith(['../login']);
  }));
});
