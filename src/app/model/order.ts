import { Item } from './item';
import { IOrder } from './IOrder';
import { DataStoreService } from '../data-store/data-store.service';
import { OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

export class Order implements OnInit, OnDestroy {
  key: string;
  name: string;
  paid: number;
  items: Item[];
  /*
  delivery: Observable<number>;
  items: Observable<Item[]>;
  subtotal: Observable<number>;
  tax: Observable<number>;
  tip: Observable<number>;
  total: Observable<number>;
  overShort: Observable<number>;
  taxPercent: Observable<number>;
  */
  itemsScript: Subscription;

  // items: Observable<Item[]>;

  constructor(public orderId: string, private service: DataStoreService) {
  }

  ngOnInit() {
    this.service.getOrder(this.orderId).map(obs => {
      this.name = obs.name;
      this.paid = obs.paid;
    });
    this.itemsScript = this.service.getItems(this.orderId).subscribe(obs => this.items)
  }

  ngOnDestroy() {
    this.itemsScript.unsubscribe();
  }
}

/*
constructor(orderId: string, private service: DataStoreService,
  public settings: Observable<Settings>, public session: Observable<Session>) {
  this.service.getOrder(orderId).map(obs => {
    this.name = obs.name;
    this.paid = obs.paid;
    this.items = this.service.getItems(orderId);
    this.subtotal = this.items.map(arr => arr.map(itm => itm.quantity * itm.price)
      .reduce((sum, value) => sum + value, 0)
    );
    // Sales tax
    //
    this.tax = Observable.combineLatest(this.subtotal,
      this.settings.map(args => args.taxPercent),
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
      (amt, chg, total: number) => {
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
  this.itemsScript.unsubscribe();
}
*/
