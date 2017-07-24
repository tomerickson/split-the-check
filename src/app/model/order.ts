import {Item} from './item';
import {Settings} from './settings';
import {Session} from './session';
import {DataStoreService} from '../data-store/data-store.service';
import {OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';

export class Order implements IOrder, OnDestroy {
  key: string;
  name: string;
  paid: number;
  delivery: Observable<number>;
  subtotal: Observable<number>;
  tax: Observable<number>;
  tip: Observable<number>;
  total: Observable<number>;
  overShort: Observable<number>;
  taxPercent: Observable<number>;
  items: Observable<Item[]>;

  constructor(orderId: string, private service: DataStoreService,
              public settings: Observable<Settings>, public session: Observable<Session>) {
    this.service.getOrder(orderId).map(obs => {
      this.key = obs.$key;
      this.name = obs.name;
      this.paid = obs.paid;
      this.service.getItems(this.key).map((array) => this.items = array
        .map((element) => element.key = element.$key));
      // subtotal
      //
      this.subtotal = this.items.map(array => array.map(item => item.quantity * item.price)
        .reduce((sum, value) => sum + value, 0));

      // Sales tax
      //
      this.tax = Observable.combineLatest(this.subtotal,
        this.settings.map(item => item.taxPercent),
        (amt, pct) => amt * pct / 100);

      // Tip
      //
      this.tip = Observable.combineLatest(
        this.subtotal,
        this.settings.map(item => item.tipPercent),
        this.settings.map(item => item.tipOption),
        this.tax,
        (amt, pct, opt, tax) => {
          if (opt.description === 'Gross') {
            amt = amt + tax;
            return amt * (+pct) / 100;
          }
        });

      // Delivery
      //
      this.delivery = Observable.combineLatest(this.subtotal,
        this.settings.map(item => item.delivery),
        this.session.map(item => item.subtotal),
        (amt, chg, total) => {
          if (total > 0 && chg > 0) {
            return chg * (amt / total);
          }
          return 0;
        });

      // Total
      //
      this.total = Observable.combineLatest(
        this.subtotal,
        this.tax,
        this.tip,
        this.delivery,
        (sub, tax, tip, del) => sub + tax + tip + del);

      // Over/Short
      //
      this.overShort = this.total.map(total => {
        return total - this.paid;
      });
  });
}

  ngOnDestroy() {
  }
}
