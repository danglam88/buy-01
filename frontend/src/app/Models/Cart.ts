import { CartItems } from "./CartItems";

export class Cart {
    items: CartItems[]=[];

    get totalPrice(): number {
        let totalPrice = 0;
        this.items.forEach(items => {
            totalPrice += items.price;
        });
        return totalPrice;
    }
}