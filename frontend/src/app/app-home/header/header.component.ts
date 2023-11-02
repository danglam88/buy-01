import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { EncryptionService } from 'src/app/services/encryption.service'
import { CreateProductComponent } from '../create-product/create-product.component';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent {
  currentRoute: string;
  //is user logged in
  // get isLoggedIn(): boolean {
  //   return this.authService.loggedIn;
  // }
  //is token expired
  tokenEx: boolean;
  routerSubscription: Subscription;


  constructor(
    private router: Router, 
    private authService: AuthenticationService, 
    private encryptionService: EncryptionService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    ) 
    {
      this.routerSubscription = this.router.events.subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.url;
        }
      });   
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  get role() : string {
    const encryptedSecret = sessionStorage.getItem('srt');
    if (encryptedSecret) {
      try {
        const role = JSON.parse(this.encryptionService.decrypt(encryptedSecret))["role"];
        return role;
      } catch (error) {
        this.throwOut();
        this.tokenEx = true;
      }
    }
    return '';
  }

  // Logs user out
  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }

  // Throws user out if token is expired or corrupted
  throwOut(): void {
    if (!this.tokenEx) {
      this.toastr.error('Data corrupted. Log-in again.', 'Illegal Operation');
      this.logout();
    }
   
  }

  // Opens create product modal
  openCreateProduct(): void {
    this.dialog.open(CreateProductComponent, {
    });
 }

 
}
