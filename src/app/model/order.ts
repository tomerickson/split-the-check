import { DataStoreService } from '../data-store/data-store.service';
import { OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { IItem } from './IItem';
import { ChangeBasis } from './change-basis';

export class Order implements OnInit, OnDestroy {
  key: string;
  name: string;
  paid: number;

  private service: DataStoreService;

  constructor(public orderId: string,
              private svc: DataStoreService) {
    this.service = svc;
  }

  get items(): Observable<IItem[]> {
    return this.service.getItems(this.key);
  }

  get subtotal(): Observable<number> {
    return this.items.map(items => items.map(item => item.quantity * item.price)
      .reduce((sum, vlu) => sum + vlu, 0));
  }

  get tax(): Observable<number> {
    return Observable.combineLatest(this.subtotal,
      this.service.taxPercent,
      ((amt, pct) => amt * pct / 100));
  }

  get tip(): Observable<number> {
    return Observable.combineLatest(this.subtotal,
      this.tax,
      this.service.tipOption,
      this.service.tipPercent,
      ((amt, tax, basis, pct) =>
        amt + ((basis.description === 'Gross') ? tax : 0) * pct));
  }

  get delivery(): Observable<number> {
    return Observable.combineLatest(this.subtotal,
      this.service.subtotal,
      this.service.delivery,
      ((subtotal, total, delivery) => (total > 0 && delivery > 0) ? delivery * (subtotal / total) : 0));
  }

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

  // items: Observable<Item[]>;

  get total(): Observable<number> {
    return Observable.combineLatest(this.subtotal,
      this.tax,
      this.tip,
      this.delivery,
      ((subtotal, tax, tip, delivery) => subtotal + tax + tip + delivery));
  }

  get overShort(): Observable<number> {
    return Observable.combineLatest(this.total, this.service.changeOption,
      ((total, basis) => Math.round((total - this.paid) / basis.value) * basis.value));
  }

  ngOnInit() {
    this.service.getOrder(this.orderId).map(obs => {
      this.name = obs.name;
      this.paid = obs.paid;
    });
  }

  ngOnDestroy() {
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
