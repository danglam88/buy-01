import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { EncryptionService } from 'src/app/services/encryption.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent {
  constructor(private builder: FormBuilder, 
    private toastr:ToastrService,
    private authService:AuthenticationService,
    private encryptionService: EncryptionService,
    private router:Router) {
      this.toastr.toastrConfig.positionClass = 'toast-bottom-right';
      sessionStorage.clear();
    }

  loginform=this.builder.group({
    username:this.builder.control('',Validators.required),
    password:this.builder.control('',Validators.required),
  });

  login() {
    this.authService.authenticate(this.loginform.value).subscribe({
      next: (result) => {
        const encryptedToken = this.encryptionService.encrypt(result['token']);
        const encryptedRole = this.encryptionService.encrypt(result['role']);
        const encryptedId = this.encryptionService.encrypt(result['id']);
  
        sessionStorage.setItem('token', encryptedToken);
        sessionStorage.setItem('role', encryptedRole);
        sessionStorage.setItem('id', encryptedId);
      },
      error: (error) => {
        console.log(error);
        if (error.status == 400) {
          if (error.error.message) {
            this.toastr.error(error.error.message);
          } else if (error.error) {
            for (let i = 0; i < error.error.length; i++) {
              this.toastr.error(error.error[i]);
            }
          } else {
            this.toastr.error('Something went wrong');
          }
        } else if (error.status == 401) {
          this.toastr.error('Invalid credentials');
        }
      },
      complete: () => {
        this.authService.login();
        const encryptedLoggedIn = this.encryptionService.encrypt('true');
        sessionStorage.setItem('loggedIn', encryptedLoggedIn);
        this.router.navigate(['../home']);
      }
    });
  }
}
