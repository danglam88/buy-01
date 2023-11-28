import { Component, Input } from '@angular/core';
import { Product } from '../../../Models/Product';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent {
  @Input() product:Product;
  @Input() searchText: string[];

  shouldShowProduct(product: any): boolean {
    if (this.searchText.length === 0) {
      return true;
    }

    return this.searchText.some(term => product.name.toLowerCase().includes(term.toLowerCase()));
  }
}
