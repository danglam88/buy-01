import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  role: string = sessionStorage.getItem('role')?.toString() ?? '';
  currentRoute: string; // Variable to track the current route
  constructor(private router: Router, private authService: AuthenticationService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Update the currentRoute variable with the current route
        this.currentRoute = event.url;
      }
    });
   }
  isLoggedIn = this.authService.loggedIn;
  

  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }
}
