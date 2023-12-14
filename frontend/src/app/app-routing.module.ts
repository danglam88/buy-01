import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogInComponent } from './authentication/log-in/log-in.component';
import { RegisterComponent } from './authentication/register/register.component';
import { ProductDashboardComponent } from './app-home/product-dashboard/product-dashboard.component';
import { UserDashboardComponent } from './app-home/my-account/user-dashboard/user-dashboard.component';
import { AuthenticateGuard } from './guard/authenticate.guard';
import { ErrorsComponent } from './errors/errors.component';
import { ProductListingComponent } from './app-home/product-listing/product-listing.component';
import { MyAccountComponent } from './app-home/my-account/my-account.component';
import { CartComponent } from './app-home/cart/cart.component';
import { OrderConfirmationComponent } from './app-home/order-confirmation/order-confirmation.component';

const routes: Routes = [

  { path: 'login', component: LogInComponent},
  { path: 'register', component: RegisterComponent },
  //AuthenticateGuard is used to protect the routes, if no user in session, currently it redirects user to login page, if the user in session is a buyer, it shows you do not have acess
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', canActivate: [AuthenticateGuard],component: ProductListingComponent },
  { path: 'product-dashboard', canActivate: [AuthenticateGuard],component: ProductDashboardComponent}, //canActivate: [AuthenticateGuard] 
  { path: 'my-account', canActivate: [AuthenticateGuard],component: MyAccountComponent},
  { path: 'user-dashboard', canActivate: [AuthenticateGuard],component: UserDashboardComponent },
  { path: 'cart', canActivate: [AuthenticateGuard],component: CartComponent},
  {path: 'order-confirmation', canActivate: [AuthenticateGuard],component: OrderConfirmationComponent},
  {path: 'forbidden', component: ErrorsComponent},
  { path: '**', component: ErrorsComponent }, // Wildcard route should be the last one
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
