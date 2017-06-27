import {Injectable, Input} from '@angular/core';
import {Order} from "../model/order";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {DataStoreService} from "../data-store/data-store.service";
import {FirebaseListObservable, FirebaseObjectObservable} from "angularfire2/database";
import {Item} from "../model/item";

@Injectable()

export class OrderService {

  // Fields
  private _id: string;
  private _order: BehaviorSubject<Order>;

  service: DataStoreService;

  constructor(svc: DataStoreService) {
    this.service = svc;
  }

  fetch(orderId?: string) {
    if (typeof orderId === "undefined"){
     this.service.createOrder()
        .then((fbo) => {
            this._order = this.getOrder(fbo.key) as BehaviorSubject<Order>;
            orderId = fbo.key;
          }
        );
    } else {
      this._order = this.getOrder(orderId) as BehaviorSubject<Order>;
    }
    this.id = orderId;
  }


  // Properties
  //
  get order(): BehaviorSubject<Order> {
    return this._order;
  }

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get items(): Observable<Item[]> {
    return this.service.getItems(this.id);
  }

  get paid() : Observable<number> {
    return this.service.getPaid(this.id);
  }

  get subtotal(): Observable<number> {
    return this.items.map((items) => items.map((item) => item.price * item.quantity)
      .reduce((total, amt) => total + amt, 0));
  }

  get tax(): Observable<number> {
    return Observable.combineLatest(this.service.TaxPercent, this.subtotal,
      (pct, amt) => amt * pct / 100);
  }

  get tip(): Observable<number> {
    return Observable.combineLatest(this.subtotal, this.tax, this.service.TipBasis,
      this.service.TipPercent,
      (sub, tax, basis, pct) => {
        let amt = sub;
        if (basis.description === "Gross") amt += tax;
        return amt * pct / 100;
    })
  }

  get delivery(): Observable<number> {
    return Observable.combineLatest(this.subtotal, this.service.Subtotal,
      this.service.Delivery,
      (amt, total, delivery) => delivery * amt / total)
  }

  get total(): Observable<number> {
    return Observable.combineLatest(this.subtotal, this.tax, this.tip, this.delivery,
      (amt, tax, tip, del) => amt + tax + tip + del);
  }

  get overShort(): Observable<number> {
    return Observable.combineLatest(this.total,
      (tot) => tot - this.order.getValue().paid);
  }

  getOrder(key: string): Observable<Order> {
    return this.service.getOrder(key);
  }

  removeOrder(key: string) {
    this.service.removeOrder(key);
  }

  setPaid(paid: number, orderId: string) {
    this.service.updateOrder(orderId, {paid: paid})
  }
}
