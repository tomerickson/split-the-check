import {Order} from './order';

export class Header {
  public title: string = "Split the Check";
  public salesTaxPercent;
  number;
  public tipPercent: number;
  public subTotal: number = 0;
  public tax: number = 0;
  public tip: number = 0;
  public delivery: number = 0;
  public total: number = 0;
  public paid: number = 0;
  public overShort: number = 0;
  public changeBasis: number = .25;
  public tipBasis: number = 1;
  public Orders: Order[];

  constructor() {
    this.Orders = [];
  }
}
