import {Item} from './item';
export class Order {
    name: string;
    subtotal: number = 0;
    tax: number = 0;
    tip: number = 0;
    delivery: number = 0;
    paid: number = 0;
    overShort: number = 0;
    items: Item[];

    constructor() {
        this.name = "Your name";
        this.items = new Array<Item>();
    }
}
