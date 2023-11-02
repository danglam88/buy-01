import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MediaService } from 'src/app/services/media.service';
import { MediaListingComponent } from './media-listing.component';
import { MediaComponent } from './media/media.component';
import { of } from 'rxjs';

describe('MediaListingComponent', () => {
  let component: MediaListingComponent;
  let fixture: ComponentFixture<MediaListingComponent>;
  let mediaService: MediaService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MediaListingComponent, MediaComponent],
      providers: [
        MediaService,
        { provide: ToastrService, useValue: { error: jasmine.createSpy('error'), success: jasmine.createSpy('success') } },
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

    // Manually spy on the Router's navigate method
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.stub();

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

  

 /* it('should navigate to login page if error status is 401 or 403', fakeAsync(() => {
    spyOn(mediaService, 'getImageByProductId').and.returnValue(of({ success: false }));
    spyOn(mediaService, 'getImageByMediaId').and.returnValue(of(new Blob()));

    component.productId = '123';
    component.getProductMedia(component.productId);

    tick(250);

    // Expect that the Router's navigate method was called with the correct arguments
    expect(router.navigate).toHaveBeenCalledWith(['../login']);
  }));*/
});
