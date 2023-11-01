import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Import HttpClientTestingModule
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MediaService } from 'src/app/services/media.service';
import { MediaListingComponent } from './media-listing.component';
import { MediaComponent } from './media/media.component';


describe('MediaListingComponent', () => {
  let component: MediaListingComponent;
  let fixture: ComponentFixture<MediaListingComponent>;
  let mediaService: MediaService;

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
        ToastrModule.forRoot()
      ]
    });
    fixture = TestBed.createComponent(MediaListingComponent);
    component = fixture.componentInstance;
    mediaService = TestBed.inject(MediaService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getProductMedia', fakeAsync(() => {
    spyOn(component, 'getProductMedia').and.callThrough();
    component.productId = '123'; // Set a mock product ID
    component.getProductMedia(component.productId);
  
    tick(250); // Simulate the passage of time

    expect(component.getProductMedia).toHaveBeenCalled();
  }));
});
