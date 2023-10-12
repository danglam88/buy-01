import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService

@Injectable()
export class AuthenticateGuard implements CanActivate {

  constructor(
    private service: AuthenticationService,
    private router: Router,
    private toastr: ToastrService // Inject ToastrService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {

    

    if(sessionStorage.getItem('loggedIn') == 'true'){
      this.service.loggedIn = true;
      return true;
    } else {
      this.router.navigate(['forbidden']);
      return false;
    }
    /*if (this.service.IsLoggedIn()) {
      if (route.url.length > 0) {
        let menu = route.url[0].path;
        if (menu == 'user') {
          if (this.service.GetUserRole() === 'Seller') {
            return true;
          } else {
            this.router.navigate(['']);
            this.toastr.warning('You do not have access.'); //For the product dashboard?
            return false;
          }
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      this.router.navigate(['login']);
      return false;
    }*/
  }  
}
