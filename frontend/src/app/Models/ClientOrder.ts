import { CartItems } from "./CartItems";

export class ClientOrder {
    items: CartItems[];
    order_id: string;
    payment_code: string;
    status_code: string;
}