import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router, NavigationEnd } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';

import { AuthenticationService } from 'src/app/services/authentication.service';
import { EncryptionService } from 'src/app/services/encryption.service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: AuthenticationService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        AuthenticationService,
        EncryptionService,
        { provide: MatDialog, useValue: {} },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            events: of(new NavigationEnd(0, 'url', 'url'))
          }
        },
      ],
      imports: [
        HttpClientTestingModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthenticationService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should logout and navigate to login', () => {
    spyOn(authService, 'logout');
    component.logout();
    expect(authService.loggedIn).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['login']);
  });

  it('should throw out if token is invalid', () => {
    component.tokenEx = true;
    spyOn(component, 'logout');
    component.throwOut();
    expect(authService.loggedIn).toBeFalse();
  });
});
