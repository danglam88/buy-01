import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { MatDialogModule } from '@angular/material/dialog';

import { AppRoutingModule } from './app-routing.module';
import { AngularMaterialModule } from './angular-material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LogInComponent } from './authentication/log-in/log-in.component';
import { RegisterComponent } from './authentication/register/register.component';
import { HeaderComponent } from './app-home/header/header.component';
import { FooterComponent } from './app-home/footer/footer.component';
import { UserDashboardComponent } from './app-home/user-dashboard/user-dashboard.component';
import { ProductDashboardComponent } from './app-home/product-dashboard/product-dashboard.component';
import { ProductListingComponent } from './app-home/product-listing/product-listing.component';
import { AppHomeComponent } from './app-home/app-home.component';
import { AuthenticationComponent } from './authentication/authentication.component'
import { ErrorsComponent } from './errors/errors.component';
import { CreateProductComponent } from './app-home/create-product/create-product.component';
import { ProductComponent } from './app-home/product-listing/product/product.component';
import { ProductDetailComponent } from './app-home/product-detail/product-detail.component';
import { ConfirmationDialogComponent } from './app-home/confirmation-dialog/confirmation-dialog.component';
import { ImageSliderComponent } from './app-home/image-slider/image-slider.component';
import { MediaListingComponent } from './app-home/media-listing/media-listing.component';
import { MediaComponent } from './app-home/media-listing/media/media.component';

import { UserService } from './services/user.service';
import { MediaService } from './services/media.service';
import { ProductService } from './services/product.service';
import { AuthenticationService } from '../app/services/authentication.service';
import { EncryptionService } from 'src/app/services/encryption.service';
import { ValidationService } from './services/validation.service';
import { ErrorService } from './services/error.service';
import { SearchComponent } from './app-home/search/search.component';
import { FilterComponent } from './app-home/product-listing/filter/filter.component';
import { MyOrdersComponent } from './app-home/my-orders/my-orders.component';
import { OrderHistoryComponent } from './app-home/my-orders/order-history/order-history.component';
import { OrderDetailsComponent } from './app-home/my-orders/order-details/order-details.component';
import { CartComponent } from './app-home/cart/cart.component';
import { StatsComponent } from './app-home/my-orders/stats/stats.component';

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
    ConfirmationDialogComponent,
    ImageSliderComponent,
    MediaListingComponent,
    MediaComponent,
    SearchComponent,
    FilterComponent,
    MyOrdersComponent,
    OrderHistoryComponent,
    OrderDetailsComponent,
    CartComponent,
    StatsComponent
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
    MatDialogModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
    }),
   
  ],
  providers: [
    AuthenticationService, 
    EncryptionService, 
    ErrorService,
    MediaService, 
    ProductService, 
    UserService, 
    ValidationService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
