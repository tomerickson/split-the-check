import {Order} from './order';
import {Item} from "./item";
import {TipBasis} from "./tip-basis";
import {Settings} from "./settings";
import {DataStoreService} from "../data-store/data-store.service";

export class Session {
  public title: string = "Split the Check";
  public delivery: number = 0;
  public orders: Order[];
  public items: Item[];
  public settings: Settings;

  constructor(public service: DataStoreService) {
    this.orders = [];
    this.items = [];
    this.settings = new Settings();
    service.sessionLink(this).then(null);
  }

  get subtotal(): number {
    let amt: number = 0;
    try {
      this.items.forEach(item => {
        amt += item.price * item.quantity;
      });
    }
    catch (err) {
      console.log(err);
    }
    return amt;
  }

  get tax(): number {
    return this.subtotal * this.settings.salesTaxPercent / 100;
  }


  get tip(): number {
    return this.calculateTip(this.subtotal, this.settings.tipBasis, this.tax, this.settings.tipPercent);
  }

  get total(): number {
    return this.subtotal + this.tax + this.tip + this.settings.delivery;
  }

  get paid(): number {
    let paid: number = 0;
    this.orders.forEach(order => {
        paid += order.paid;
      }
    );
    return paid;
  }

  calculateTip(subtotal: number, basis: TipBasis, tax: number, pct: number): number {
    let amt = subtotal;
    if (basis.description === 'Gross') {
      amt += tax;
    }
    return amt * pct / 100;
  }

  get overShort(): number {
    return this.subtotal + this.tax + this.tip + this.settings.delivery - this.paid;
  }

}
