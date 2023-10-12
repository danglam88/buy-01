import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogInComponent } from './authentication/log-in/log-in.component';
import { RegisterComponent } from './authentication/register/register.component';
import  { AppHomeComponent } from './app-home/app-home.component';
import { ProductDashboardComponent } from './app-home/product-dashboard/product-dashboard.component';
import { UserDashboardComponent } from './app-home/user-dashboard/user-dashboard.component';
import { AuthenticateGuard } from './guard/authenticate.guard';
import { ErrorsComponent } from './errors/errors.component';
import { ProductListingComponent } from './app-home/product-listing/product-listing.component';
import { CreateProductComponent } from './app-home/create-product/create-product.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LogInComponent },
  { path: 'register', component: RegisterComponent },
  //AuthenticateGuard is used to protect the routes, if no user in session, currently it redirects user to login page, if the user in session is a buyer, it shows you do not have acess
  //Problem is: login is currently led to home
  { path: 'home', canActivate: [AuthenticateGuard],component: ProductListingComponent },
  { path: 'product-dashboard', canActivate: [AuthenticateGuard],component: ProductDashboardComponent}, //canActivate: [AuthenticateGuard] 
  { path: 'user-dashboard', canActivate: [AuthenticateGuard],component: UserDashboardComponent },
  {path: 'forbidden', component: ErrorsComponent},
  { path: '**', component: ErrorsComponent }, // Wildcard route should be the last one
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
