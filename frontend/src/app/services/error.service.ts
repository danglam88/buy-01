import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private toastr: ToastrService, private router: Router) { }

  handleSessionExpirationError(): void {
    this.toastr.error('Session expired. Log-in again.');
    this.router.navigate(['../login']);
  }

  handleBadRequestError(error: any): void {
      if (error.error.message) {
        this.toastr.error(error.error.message);
      } else if (error.error && error.error[0]) {
        this.toastr.error(error.error[0]);
      } else {
        this.toastr.error('Something went wrong');
    }
  }

  isAuthError(status: number): boolean {
    return status === 401 || status === 403;
  }

  is400Error(status: number): boolean {
    return status === 400;
  }
}
