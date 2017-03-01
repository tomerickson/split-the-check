import {Settings} from "./settings";
import {Order} from "./order";

export class Totals {
  Orders: Order[];

  constructor(private settings: Settings) {
    this.Orders = [];
  }

  get OverShort(): number {
    return this.Total - this.Paid;
  }

  get Subtotal(): number {
    let amt = 0;
    for (let order of this.Orders){
      amt += order.subtotal;
    }
    return amt;
  }

  get Paid(): number {
    let amt = 0;
    for (let order of this.Orders){
      amt += order.paid;
    }
    return amt;
  }

  get Total(): number {
    return this.Subtotal + this.Tax + this.Tip + this.settings.Delivery;
  }

  get Tip(): number {
    if (this.settings.TipBasis == 1) {
      return Math.round(this.Subtotal * (this.settings.TipPercent / 100)) * 100;
    } else {
      return Math.round((this.Subtotal + this.Tax) * (this.settings.TipPercent / 100)) * 100;
    }
  }

  get Tax(): number {
    return Math.round(this.Subtotal * (this.settings.SalesTaxPercent / 100)) * 100;
  }
}


