import {item} from './item';
export class order {
    name: string;
    subTotal: number = 0;
    tax: number = 0;
    tip: number = 0;
    delivery: number = 0;
    paid: number = 0;
    overShort: number = 0;
    items: item[];

    constructor() {
        this.items = new Array<item>();
    }
}
