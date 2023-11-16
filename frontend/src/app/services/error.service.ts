import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private toastr: ToastrService, private router: Router) { }

  handleSessionExpiration(): void {
    this.toastr.error('Session expired. Log-in again.');
    this.router.navigate(['../login']);
  }

  isAuthError(status: number): boolean {
    return status === 401 || status === 403;
  }
}
