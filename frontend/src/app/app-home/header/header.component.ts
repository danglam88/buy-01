import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { EncryptionService } from 'src/app/services/encryption.service'
import { CreateProductComponent } from '../create-product/create-product.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  role: string = ''; // Initialize to an empty string
  currentRoute: string;
  isLoggedIn = this.authService.loggedIn;

  constructor(
    private router: Router, 
    private authService: AuthenticationService, 
    private encryptionService: EncryptionService,
    private dialog: MatDialog,
    ) 
    {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });

    const encryptedRole = sessionStorage.getItem('role');
    if (encryptedRole) {
      this.role = this.encryptionService.decrypt(encryptedRole);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }

  openCreateProduct(): void {
    this.dialog.open(CreateProductComponent, {
   });
 }
}
