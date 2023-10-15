import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaListingComponent } from './media-listing.component';

describe('MediaListingComponent', () => {
  let component: MediaListingComponent;
  let fixture: ComponentFixture<MediaListingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MediaListingComponent]
    });
    fixture = TestBed.createComponent(MediaListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
