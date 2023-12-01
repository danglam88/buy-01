import { Product } from "./Product";

export class CartItems {
   constructor (product: Product) {
    this.product = product;
   }
   product: Product;
   quantity:number=1;
   price:number=0;
}