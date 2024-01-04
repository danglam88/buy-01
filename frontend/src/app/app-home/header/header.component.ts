import { Component } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";

import { AuthenticationService } from "src/app/services/authentication.service";
import { EncryptionService } from "src/app/services/encryption.service";
import { CreateProductComponent } from "../create-product/create-product.component";

import { CartService } from "src/app/services/cart.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"]
})
export class HeaderComponent {
  currentRoute: string;
  tokenEx: boolean;
  routerSubscription: Subscription;
  cartItems = 0;
  cartItemsSubscription: Subscription;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private encryptionService: EncryptionService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private cartService: CartService
  ) {
    this.routerSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  ngOnInit() {
    if (this.role === "CLIENT") {
      this.getCartItemsNumber();
    }

    // Subscribe to isAddedToCart$ observable
    this.cartService.cartUpdate$.subscribe((isAddedToCart) => {
      if (isAddedToCart) {
        this.getCartItemsNumber();
        
      }
    });

  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  get role(): string {
    const encryptedSecret = localStorage.getItem("srt");
    if (encryptedSecret) {
      try {
        const role = JSON.parse(
          this.encryptionService.decrypt(encryptedSecret)
        )["role"];
        return role;
      } catch (error) {
        this.throwOut();
        this.tokenEx = true;
      }
    }
    return "";
  }

  // Logs user out
  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }

  // Throws user out if token is expired or corrupted
  throwOut(): void {
    if (!this.tokenEx) {
      this.toastr.error("Data corrupted. Log-in again.", "Illegal Operation");
      this.logout();
    }
  }

  // Display length of cart items 
  getCartItemsNumber() {
    setTimeout(() => {
      this.cartService.getCart().subscribe({
        next: (items: any) => {
          this.cartItems = items.length;
          this.cartService.setCartItems(items);
        },
        error: (error) => {
          console.error("Error fetching cart data", error);
        },
      });
    }, 250);
  }

  // Opens create product modal
  openCreateProduct(): void {
    this.dialog.open(CreateProductComponent, {});
  }
}
