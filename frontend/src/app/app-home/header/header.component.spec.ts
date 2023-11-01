import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { EncryptionService } from 'src/app/services/encryption.service';
import { ToastrService, ToastrModule } from 'ngx-toastr'; 
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        AuthenticationService,
        EncryptionService,
        ToastrService, 
        MatDialog
      ],
      imports: [
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatDialogModule,
        ToastrModule.forRoot() 
      ]
    });

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
