import {Item} from './item';
import {OnInit, OnDestroy} from "@angular/core";
import {Totals} from "./totals";
import {Settings} from "./settings";

export class Order implements OnInit, OnDestroy {
  name: string;
  tipBasis: number;
  tipPercent: number;
  paid: number = 0;
  overShort: number = 0;
  items: Item[] = [];

  constructor(private settings: Settings, private totals: Totals) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  get subtotal() {
    let subtotal = 0;
    for (let item of this.items) {
      subtotal += item.quantity * item.price;
    }
    return subtotal;
  }

  get tax(): number {
    return this.subtotal * (this.settings.salesTaxPercent / 100);
  }
  get tip(): number {
    let amt: number = 0;
    let subtotal = this.subtotal;
    let tax = this.tax;
    if (this.tipBasis === 1) {
      amt = subtotal * this.tipPercent / 100;
    } else {
      if (this.settings.tipBasis === 0) {
        amt = (subtotal + tax) * this.tipPercent / 100;
      }
    }
    return amt;
  }
  get delivery() {
    let amt = 0;
    if (this.totals.Subtotal > 0) {
      amt = this.totals.Subtotal * (this.subtotal / this.totals.Subtotal);
    }
    return amt;
  }
}
