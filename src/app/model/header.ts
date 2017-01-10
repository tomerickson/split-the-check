import { order } from './order';

export class header {
    salesTaxPercent: number = 5;
    deliveryChange: number = 0;
    tipPercent: number = 0;
    subTotal: number = 0;
    tax: number = 0;
    tip: number = 0;
    delivery: number = 0;
    total: number = 0;
    paid: number = 0;
    overShort: number = 0;
    changeBasis: number = .25;
    orders: order[];


    constructor() {
        this.orders = new Array<order>();
    }
}
