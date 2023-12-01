import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailComponent } from '../../product-detail/product-detail.component';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent {
  userInfoRole: string = '';
  product = {
    description: "Avatars for social media",
    editable: true,
    id: "6569fb6018b4e222a419a4f8",
    name: "Avatars",
    price: 40,
    quantity: 4,
  }

  constructor(private userService: UserService,  private dialog: MatDialog, ) { }

  ngOnInit(): void {

    this.userService.userInfoRole$.subscribe((role) => {
      this.userInfoRole = role;
      // Do something with the updated role, for example, update your view
    });

    this.product.editable = false
  }

    // Opens product detail modal
    openProductDetail(product): void {
      this.dialog.open(ProductDetailComponent, {
       data: {
         product: product, 
         view: 'order'
       },
     });
   }
 
}
