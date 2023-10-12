import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent {
  
  userInfo: any = {
    username: '',
    password: ''
  };

  constructor(private builder: FormBuilder, 
    private toastr:ToastrService,
    private authService:AuthenticationService,
    private router:Router) {
      this.toastr.toastrConfig.positionClass = 'toast-bottom-right';
      sessionStorage.clear();
    }

  userdata:any;

  loginform=this.builder.group({
    username:this.builder.control('',Validators.required),
    password:this.builder.control('',Validators.required),
  });

  login() {
    console.log(JSON.stringify(this.loginform.value));
    this.authService.authenticate(this.userInfo).subscribe({
      next: (result) => {
        console.log(result);
        sessionStorage.setItem('token', result['token']);
        sessionStorage.setItem('role', result['role']);
      },
      error: (error) => {
        console.log(error);
        if (error.status == 400) {
          for (let i = 0; i < error.error.length; i++) {
            this.toastr.error(error.error[i]);
          }
        } else if (error.status == 401) {
          this.toastr.error('Invalid credentials');
        }
      },
      complete: () => {
        this.authService.login();
        sessionStorage.setItem('loggedIn', 'true');
        this.router.navigate(['../home']);
      }
    });
  }
}
