import { Media } from "./Media";

export class Product {
    id: string; 
    name:string; 
    description: string;
    price: number;
    quantity: number;
    editable: boolean;
    // selectedQuantity: number;
    productMedia: Media[];
}
