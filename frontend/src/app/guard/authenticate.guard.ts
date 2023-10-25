import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../services/encryption.service'; // Import EncryptionService

@Injectable()
export class AuthenticateGuard implements CanActivate {

  constructor(
    private service: AuthenticationService,
    private router: Router,
    private toastr: ToastrService,
    private encryptionService: EncryptionService // Inject EncryptionService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {

    // Decrypt the loggedIn value from sessionStorage
    const encryptedLoggedIn = sessionStorage.getItem('loggedIn');
    if (encryptedLoggedIn) {
      const loggedIn = this.encryptionService.decrypt(encryptedLoggedIn);
      if (loggedIn === 'true') {
        this.service.loggedIn = true;
        return true;
      }
    }

    this.router.navigate(['login']);
    return false;
  }  
}
