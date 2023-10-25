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
  }

  get role() : string {
    const encryptedSecret = sessionStorage.getItem('srt');
    if (encryptedSecret) {
      try {
        const role = JSON.parse(this.encryptionService.decrypt(encryptedSecret))["role"];
        return role;
      } catch (error) {
        this.router.navigate(['../login']);
      }
    }
    return '';
  }

  // Logs user out
  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }

  // Opens create product modal
  openCreateProduct(): void {
    this.dialog.open(CreateProductComponent, {
   });
 }
}
