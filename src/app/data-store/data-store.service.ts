import {Injectable, OnDestroy} from '@angular/core';
import {DataProviderService} from '../data-provider/data-provider.service';
import {TipBasis} from '../model/tip-basis';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/defaultIfEmpty';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/toPromise';
import {ChangeBasis} from '../model/change-basis';
import {Order} from '../model/order';
import {Thenable} from "firebase/app";
import {Item} from "../model/item";
import {FirebaseListObservable, FirebaseObjectObservable} from "angularfire2/database";
import {Subscription} from "rxjs/Subscription";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";


@Injectable()

export class DataStoreService implements OnDestroy {

  private service: DataProviderService;
  private firstTime: boolean = true;

  Orders: Observable<Order[]>;
  Items: FirebaseListObservable<any[]>;

  TipOptions: Observable<TipBasis[]>;
  ChangeOptions: Observable<ChangeBasis[]>;
  ChangeBasis: Observable<ChangeBasis>;
  TipBasis: Observable<TipBasis>;
  TaxPercent: Observable<number>;
  TipPercent: Observable<number>;
  Subtotal: Observable<number>;
  TaxAmount: Observable<number>;
  TipAmount: Observable<number>;
  Delivery: Observable<number>;
  Total: Observable<number>;
  Paid: Observable<number>;
  OverShort: Observable<number>;
  OrderCount: Observable<number>;
  ShowIntro: Observable<boolean>;

  constructor(private svc: DataProviderService) {
    this.service = svc;
    // TODO: Initialize TipBasis and ChangeBasis from defaults
    //
    if (this.firstTime) {
      this.service.db.app.database().goOnline();
      this.setDefaults();
    }

    this.Orders = this.service.getList('/orders').defaultIfEmpty([]);
    this.Items = this.service.getList('/items');
    this.TipOptions = this.service.query('/enumerations/tipOptions', {orderByKey: true});
    this.ChangeOptions = this.service.query('/enumerations/changeOptions', {orderByKey: true});
    this.ChangeBasis = this.service.getItem('/orderSummary/changeOption');
    this.TipBasis = this.service.getItem('/orderSummary/tipOption');
    this.TaxPercent = this.service.getItem('/orderSummary/taxPercent');
    this.TipPercent = this.service.getItem('/orderSummary/tipPercent');
    this.Subtotal = this.service.getList('/items')
      .map((item) => item.quantity * item.price)
      .reduce((sum, amt) => sum + amt, 0);

    this.OrderCount = this.service.getList('/orders')
      .map(orders => orders.map(() => 1))
      .reduce((sum, one) => sum + one, 0)
      .defaultIfEmpty(0);

    this.TaxAmount = this.service.getItem('/orderSummary/tax');
    this.TipAmount = this.service.getItem('/orderSummary/tip');
    this.Delivery = this.service.getItem('/orderSummary/delivery');
    this.Paid = this.service.getItem('/orderSummary/paid');
    this.Total = Observable.combineLatest(
      this.Subtotal,
      this.TaxAmount,
      this.TipAmount,
      this.Delivery,
      ((subtotal, tax, tip, delivery) => subtotal + tax + tip + delivery))
      .defaultIfEmpty(0);

    this.OverShort = Observable
      .combineLatest(this.Total, this.Paid, (total, paid) => total - paid)
      .defaultIfEmpty(0);

    this.ShowIntro = this.service.getItem('/orderSummary/showIntro');

  }

  setDefaults() {
    let result: boolean;
    result = this.service.copyNode('/defaults/taxPercent', '/orderSummary/taxPercent');
    if (result) this.service.copyNode('/defaults/tipPercent', '/orderSummary/tipPercent');
    if (result) this.service.copyNode('/defaults/delivery', '/orderSummary/delivery');

    if (result) {
      this.getDefaultTipOption().then(data => {
        this.service.updatePath('/orderSummary/tipOption', data);
      })
    }
    if (result) {
      this.getDefaultChangeOption().then(data => {
        this.service.updatePath('/orderSummary/changeOption', data);
      })
    }
    // if (result) this.service.updatePath('/orderSummary/tipOption', this.getDefaultTipOption()).then(data => data);
    // if (result) this.service.updatePath('/orderSummary/changeOption', this.getDefaultChangeOption().then(data=>data);
    this.firstTime = false;
  }

  ngOnDestroy() {
    this.service.db.app.database().goOffline();
  }

  // Settings
  //
  getDefaultTipOption(): Promise<TipBasis> {
    const path = 'enumerations/tipOptions';
    const filter = {orderByChild: 'isDefault', equalTo: true, limitToFirst: 1};
    return this.service.query(path, filter)
      .first()
      .map(options => options[0])
      .toPromise()
  }

  getDefaultChangeOption(): Promise<ChangeBasis> {
    const path = 'enumerations/changeOptions';
    const filter = {orderByChild: 'isDefault', equalTo: true, limitToFirst: 1};
    return this.service.query(path, filter)
      .first()
      .map(options => options[0])
      .toPromise();
  }

  toggleShowIntro(choice: boolean) {
    this.service.set('/defaults/showIntro', choice);
  }

  setTaxPercent(value: number) {
    this.service.set('/orderSummary/taxPercent', +value);
  }

  setTipPercent(value: number) {
    this.service.set('/orderSummary/tipPercent', +value);
  }

  setDelivery(value: number) {
    this.service.set('/orderSummary/delivery', +value);
  }

  setChangeBasis(index: number) {
    let changeBasis: ChangeBasis;
    const path = 'enumerations/changeOptions';
    let obs = this.service.getList(path);
    let sub = obs.subscribe(opt => changeBasis = opt[index]);
    sub.unsubscribe();
    this.service.updatePath('orderSummary/changeOption', changeBasis);
  }

  setTipBasis(index: number) {
    let tipBasis: TipBasis;
    const path = 'enumerations/tipOptions';
    let obs = this.service.getList(path);
    let sub = obs.subscribe(tip => tipBasis = tip[index]);
    sub.unsubscribe();
    this.service.updatePath('orderSummary/tipOption', tipBasis);
  }

  wrapup() {
    this.service.remove('/orders');
    this.service.remove('/items');
  }

  createOrder(): Thenable<Order> {
    let order: Observable<Order>;
    return this.addOrder()
  }

  // Order level queries
  //
  addOrder(): Thenable<Order> {
    let order: Order = new Order();
    return this.service.push<Order>('/orders', order);
  }

  removeOrder(key: string) {
    let fbo = this.service.getItem('/orders/' + key) as FirebaseObjectObservable<Order>;
    return fbo.remove();
  }

  getOrder(key: any): Observable<Order> {
    return this.service.getItem('/orders/' + key);
  }

  getPaid(key: string): Observable<number> {
    return this.service.getItem('/orders/' + key + '/paid');
  }

  getItems(orderId: string) {
    return this.service.getList('/items/' + orderId);
  }

  updateOrder(key: string, updates: object): Thenable<any> {
    let foo = this.service.getItem('orders/' + key) as FirebaseObjectObservable<Order>;
    return foo.update(updates);
  }

  setPaid(order: Order, paid: number) {

  }

  // Item-level queries
  //
  addItem(orderKey: string): Thenable<Item> {
    const item = new Item(orderKey);
    return this.service.push<Item>('/items', item)
  }

  removeItem(item: Item) {
    let fbo = this.service.getItem('/items/' + item.key) as FirebaseObjectObservable<Item>;
    return fbo.remove();
  }

  getItem(key: string) {
    return this.service.getItem('/items/' + key);
  }

  updateItem(item: Item, updates: object): Thenable<any> {
    let foo = this.service.getItem('/items/' + item.key) as FirebaseObjectObservable<Item>;
    return foo.update(updates);
  }

  // App-level queries
  //
  mockQuery(): Observable<TipBasis[]> {
    return this.service.mockQuery();
  }

}
