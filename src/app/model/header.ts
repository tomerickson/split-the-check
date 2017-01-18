import { order } from './order';

export class header {
    public salesTaxPercent: number = 5;
    public deliveryChange: number = 0;
    public tipPercent: number = 0;
    public subTotal: number = 0;
    public tax: number = 0;
    public tip: number = 0;
    public delivery: number = 0;
    public total: number = 0;
    public paid: number = 0;
    public overShort: number = 0;
    public changeBasis: number = .25;
    public tipBasis: number = 0;
    public orders: order[];


    constructor() {
        this.orders = new Array<order>();
    }
}
