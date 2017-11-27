import {IItem, IOrder} from './index';
import {DataStoreService} from '../data-store/data-store.service';
import {OnDestroy} from '@angular/core';
import {Helpers} from './helpers';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class Session implements OnDestroy {
  public title = 'Split the Check';

  constructor(public service: DataStoreService) {
  }

  get orders(): BehaviorSubject<IOrder[]> {
    return this.service.allOrders as BehaviorSubject<IOrder[]>;
  }

  get items(): BehaviorSubject<IItem[]> {
    return this.service.allItems as BehaviorSubject<IItem[]>;
  }
  get subtotal(): Observable<number> {
    return this.service.allItems.map(arr => arr.map(itm => itm.price * itm.quantity)
      .reduce((acc, vlu) => acc + vlu, 0));
  }

  get tax(): Observable<number> {
    return Observable.combineLatest(this.subtotal, this.service.taxPercent,
      (amt, pct) => amt * pct / 100);
  }

  get tip(): Observable<number> {
    return Observable.combineLatest(this.subtotal, this.tax, this.service.tipOption, this.service.tipPercent,
      (amt, tax, tipBasis, tipPercent) =>
        Helpers.calculateTip(amt, tipBasis, tax, tipPercent));
  }

  get delivery(): Observable<number> {
    return this.service.delivery;
  }

  get total(): Observable<number> {
    return Observable.combineLatest(this.subtotal, this.tax, this.tip, this.delivery,
      (amt, tax, tip, delivery) => amt + tax + tip + delivery);
  }

  get paid(): Observable<number> {
    return this.service.allOrders.map(arr => arr.map((order: IOrder) => order.paid)
      .reduce((acc, amt) => acc + amt, 0));
  }

  // Round the total to the nearest penny before
  // calculating change
  //
  get overShort(): Observable<number> {
    return Observable.combineLatest(this.total, this.paid,
      (total, paid) => Math.round(total * 100) / 100 - paid);
  }

  ngOnDestroy() {
  }
}
