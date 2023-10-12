import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AuthenticateGuard } from '../app/guard/authenticate.guard';
import { AuthenticationService } from '../app/services/authentication.service';
import { UserInfoService } from '../app/services/user-info.service';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularMaterialModule } from './angular-material.module';
import { LogInComponent } from './authentication/log-in/log-in.component';
import { RegisterComponent } from './authentication/register/register.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './app-home/header/header.component';
import { FooterComponent } from './app-home/footer/footer.component';
import { UserDashboardComponent } from './app-home/user-dashboard/user-dashboard.component';
import { ProductDashboardComponent } from './app-home/product-dashboard/product-dashboard.component';
import { ProductListingComponent } from './app-home/product-listing/product-listing.component';
import { AppHomeComponent } from './app-home/app-home.component';
import { AuthenticationComponent } from './authentication/authentication.component'
import { ToastrModule } from 'ngx-toastr';
import { ErrorsComponent } from './errors/errors.component';
import { CreateProductComponent } from './app-home/create-product/create-product.component';
import { ProductComponent } from './app-home/product-listing/product/product.component';
import { ProductDetailComponent } from './app-home/product-detail/product-detail.component';
import { MatDialogModule } from '@angular/material/dialog';
import { HighlightDirective } from './CustomDirectives/highlight.directive';
import { ConfirmationDialogComponent } from './app-home/confirmation-dialog/confirmation-dialog.component';
@NgModule({
  declarations: [
    AppComponent,
    LogInComponent,
    RegisterComponent,
    HeaderComponent,
    FooterComponent,
    UserDashboardComponent,
    ProductDashboardComponent,
    ProductListingComponent,
    AppHomeComponent,
    AuthenticationComponent,
    ErrorsComponent,
    CreateProductComponent,
    ProductComponent,
    ProductDetailComponent,
    HighlightDirective,
    ConfirmationDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FlexLayoutModule,
    FormsModule, 
    ReactiveFormsModule,
    HttpClientModule,
    ToastrModule.forRoot(),
    MatDialogModule
  ],
  providers: [AuthenticateGuard, AuthenticationService, UserInfoService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
