import {Item} from "./item";
import {Settings} from "./settings";

export class Order implements IDomainObject {
  key: string; // Key generated by application
  name: string; // Name of person who placed order
  paid: number; // Amount paid
  items: Item[];
  settings: Settings;

  constructor(orderId:string = "") {
    this.key = orderId;
    this.name = "";
    this.paid = 0;
    this.items = [];
    this.settings = new Settings();
  }

  get count(): number {
    return this.items.length;
  }

  get subtotal(): number {
    return this.items.map(item => item.quantity * item.price)
      .reduce((total, value) => total + value);
  }

  get tax(): number {
    return this.subtotal * this.settings.salesTaxPercent / 100;
  }

  get tip(): number {
    let amt = this.subtotal;
    if (this.settings.tipBasis.description === 'Gross') {
      amt += this.tax;
    }
    return amt * this.settings.tipPercent / 100;
  }


  get delivery(): number {
    let amt = this.settings.delivery;
    if (amt > 0) {
      return
    }
  }

}
