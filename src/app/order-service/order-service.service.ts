import {Injectable, Input} from '@angular/core';
import {Order} from "../model/order";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {DataStoreService} from "../data-store/data-store.service";
import {Item} from "../model/item";
import {FirebaseListObservable} from "angularfire2/database";

@Injectable()

export class OrderService {

  // Fields
  private id: string;
  Order: Observable<Order>;
  Items: FirebaseListObservable<Item[]>;
  Subtotal: Observable<number>;
  Tax: Observable<number>;
  Tip: Observable<number>;
  Delivery: Observable<number>;
  Total: Observable<number>;
  Paid: Observable<number>;
  OverShort: Observable<number>;


  constructor(private service: DataStoreService) {
  }

  initialize(orderId: string) {
    this.id = orderId;
    this.Order = this.getOrder(orderId);
    this.Items = this.service.getItems(orderId);

    this.Subtotal = this.Items
      .flatMap(items => items.map(item => item.quantity * item.price))
      .reduce((total:number, amt:number) => total + amt, 0) as Observable<number>;

    this.Tax = Observable.combineLatest(this.service.TaxPercent, this.Subtotal,
      (pct, amt) => amt * pct / 100);

    this.Tip = Observable.combineLatest(this.Subtotal, this.Tax, this.service.TipBasis,
      this.service.TipPercent,
      (sub, tax, basis, pct) => {
        let amt = sub;
        if (basis.description === "Gross") amt += tax;
        return amt * pct / 100;
      });

    this.Delivery = Observable.combineLatest(this.Subtotal, this.service.Subtotal,
      this.service.Delivery,
      (amt, total, delivery) => delivery * amt / total);

    this.Total = Observable.combineLatest(this.Subtotal, this.Tax, this.Tip, this.Delivery,
      (amt, tax, tip, del) => amt + tax + tip + del);

    this.Paid = this.service.getPaid(this.OrderId);

    this.OverShort = Observable.combineLatest(this.Total, this.Paid, (total, paid) => total - paid)
      .defaultIfEmpty(0);
  }

  fetch(orderId: string) {
    this.Order = this.getOrder(orderId);
    this.id = orderId;
  }

  get OrderId(): string {
    return this.id;
  }

  private getOrder(key: string): Observable<Order> {
    return this.service.getOrder(key);
  }

  removeOrder() {
    this.service.removeOrder(this.id);
  }

  setName(name: string) {
    this.service.updateOrder(this.OrderId, {name: name});
  }

  setPaid(paid: number) {
    this.service.updateOrder(this.OrderId, {paid: paid});
  }
}
