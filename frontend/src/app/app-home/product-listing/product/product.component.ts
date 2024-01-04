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
  @Input() selectedFilterRadioButton: string;
  
  shouldShowProduct(product: any): boolean {
    if (this.searchText?.length === 0) {
      return true;
    }
    return this.searchText?.some(keyword => product.name.toLowerCase().includes(keyword.toLowerCase()));
  }

  shouldShowProductBasedOnFilter(product: Product, filter: string): boolean {
    switch (filter) {
      case 'under100':
        return product.price < 100000;
      case 'under200':
        return product.price >= 100000 && product.price < 200000;
      case 'under300':
        return product.price >= 200000 && product.price < 300000;
      case 'under400':
        return product.price >= 300000 && product.price < 400000;
      case 'above400':
        return product.price >= 400000;
      default:
        return true; 
    }
  }

}
