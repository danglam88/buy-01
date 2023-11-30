import { Product } from "./Product";

export class CartItems {
   constructor (product: Product) {
    this.product = product;
   }
   product: Product;
   quantity:number=1;
   get price(): number {
    return this.product.price * this.quantity;
   }
}