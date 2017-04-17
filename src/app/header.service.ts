/**
 * Created by Erick on 3/7/2017.
 */
import {HttpModule, Response, Headers, RequestOptions, Http} from "@angular/http";
import "rxjs/Rx";
// import "rxjs/observable/"
// import {Observable} from "rxjs";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Injectable} from "@angular/core";
import {TipBasis} from "./model/tip-basis";
import {ChangeBasis} from "./model/change-basis";
import {Order} from "./model/order";
import {Item} from "./model/item";
import {IDefault} from "./model/IDefault";
import {ArrayObservable} from "rxjs/observable/ArrayObservable";
import {Observable, Subscription} from "rxjs";

@Injectable()

export class HeaderService {

  private readonly settingsUrl = "./assets/data/settings.json";
  private readonly totalsUrl = "./assets/data/totals.json";

  private httpHeaders: Headers;
  private options: RequestOptions;
  private tipBases: BehaviorSubject<TipBasis[]>;
  private changeBases: BehaviorSubject<ChangeBasis[]>;
  private _orders: Order[];
  readonly orders: BehaviorSubject<Order[]>;
  public count: Observable<number>;
  subtotal: BehaviorSubject<number>;
  taxPercent: BehaviorSubject<number>;
  tipPercent: BehaviorSubject<number>;
  delivery: BehaviorSubject<number>;
  tipBasis: BehaviorSubject<TipBasis>;
  chgBasis: BehaviorSubject<ChangeBasis>;

  constructor(private http: Http) {
    this.httpHeaders = new Headers();
    this.httpHeaders.append("content-type", "application/json");
    this.options = new RequestOptions({headers: this.httpHeaders});
    this._orders = [];
    this.orders = new BehaviorSubject(this._orders);

    this.count = Observable.of(this._orders.reduce(
      (acc, val) => acc += 1, 0));

    this.subtotal = new BehaviorSubject(this._orders
      .map((arr, i) => arr[i].subtotal)
      .reduce((acc, val) => acc += val, 0));


    this.taxPercent = new BehaviorSubject<number>(0);
    this.tipPercent = new BehaviorSubject<number>(0);
    this.delivery = new BehaviorSubject<number>(0);
    this.tipBases = new BehaviorSubject<TipBasis[]>([]);
    this.changeBases = new BehaviorSubject<ChangeBasis[]>([]);
    this.tipBasis = new BehaviorSubject<TipBasis>(null);
    this.chgBasis = new BehaviorSubject<ChangeBasis>(null);

    this.subscribeToSetting(this.taxPercent, "salesTaxPercent");
    this.subscribeToSetting(this.tipPercent, "tipPercent");
    this.subscribeToList(this.tipBases, "tipBases");
    this.subscribeToList(this.changeBases, "changeBases");
    this.subscribeToDefault(this.tipBasis, "tipBases");
    this.subscribeToDefault(this.chgBasis, "changeBases");
  }

  wrapup() {
    this._orders = [];
    this.orders.next(this._orders);
    /*
    this.taxPercent.unsubscribe();
    this.tipPercent.unsubscribe();
    this.tipBases.unsubscribe();
    this.changeBases.unsubscribe();
    */
  }

  get tax() {
    let amt = this.subtotal.getValue();
    let pct = this.taxPercent.getValue();
    if (amt && pct) {
      return amt * pct / 100;
    }
    return 0;
  }

  get tip() {
    let amt = this.subtotal.getValue();
    let basis: TipBasis = this.tipBasis.getValue();
    let pct = this.tipPercent.getValue();
    if (basis && pct) {
      if (basis.description == "Gross") {
        amt += this.tax;
      }
    }
    return amt * pct / 100;
  }

  get total() {
    let amt = 0;
    return this.subtotal.getValue() + this.tax + this.tip + this.delivery.getValue();
  }

  get paid() {
    let amt = 0;
    for (let order of this.orders.getValue()) {
      amt += order.paid;
    }
    return amt;
  }

  get overShort() {
    let amt = 0;
    for (let order of this.orders.getValue()) {
      amt += order.total - order.paid;
    }
    return amt;
  }

  getTipBases() {
    return this.tipBases.asObservable();
  }

  getChangeBases() {
    return this.changeBases.asObservable();
  }

  // Create the subscriptions for the settings
  //
  private subscribeToSetting(subscriber: BehaviorSubject<number>, setting: string): void {
    this.http.get(this.settingsUrl, this.options)
      .map((res) => {
        let obj = res.json().settings;
        return obj[setting];
      })
      .subscribe(result => subscriber.next(result));
  }

  private subscribeToList(subscriber: BehaviorSubject<any>, list: string): void {
    this.http.get(this.settingsUrl, this.options)
      .map((res) => {
        console.info(res.json()[list]);
        return res.json()[list];
      })
      .subscribe(result => subscriber.next(result));
  }

  private subscribeToDefault(subscriber: BehaviorSubject<any>, list: string): void {
    this.http.get(this.settingsUrl, this.options)
      .map((res) => {
        let arr: IDefault[] = res.json()[list];
        arr = arr.filter(obj => obj.isDefault);
        return arr[0];
      })
      .catch((res) => {
        console.log(res);
        return res;
      })
      .subscribe(result => subscriber.next(result));
  }

  private subscribeToTotal(subscriber: BehaviorSubject<number>, node: string): void {
    this.http.get(this.totalsUrl, this.options)
      .map((res) => {
        return res.json().totals[node];
      })
      .subscribe(result => subscriber.next(result));
  }


  getTipPercent(): Observable<number> {
    return this.tipPercent.asObservable();
  }

  setTipPercent(value: number) {
    this.tipPercent.next(value);
  }

  setTipBasis(value: TipBasis) {
    this.tipBasis.next(value);
  }

  setChangeBasis(value: ChangeBasis) {
    this.chgBasis.next(value)
  }

  setDelivery(value: number) {
    this.delivery.next(value);
  }

  // Order methods
  //
  getOrders(): Observable<Order[]> {
    return this.orders.asObservable();
  }

  addOrder(): Observable<Order[]> {
    let obs = this.saveOrder(new Order(this));
    obs.subscribe(res => this._orders);
    console.log("addOrder order count: " + this._orders.length);
    return obs;
  }

  saveOrder(newOrder: Order): Observable<Order[]> {
    let arr = this._orders;
    arr.push(newOrder);
    this._orders = arr;
    this.orders.next(this._orders);
    return this.orders.asObservable();
  }

  removeOrder(index: number) {
    this._orders.splice(index, 1);
    console.log("order count: " + this._orders.length);
  }

  // Item methods
  //

  saveItem(order: Order, newItem: Item) : Observable<Item[]> {
    let arr = order._items;
    arr.push(newItem);
    order._items = arr;
    order.items.next(order._items);
    return order.items.asObservable();
  }

  addItem(order: Order) : Observable<Item[]> {
    let obs = this.saveItem(order, new Item());
    obs.subscribe(res => order._items);
    console.log("addItem item count:" + order._items.length);
    return obs;
  }

  removeItem(order: Order, item:number){
    return order.removeItem(item);
  }

  updateItemField(item: Item, fieldName: string, value: any) {
    item[fieldName] = value;
  }

  calculateDelivery(subtotal) {
    if (subtotal == 0) {
      return 0;
    }
    return this.delivery.getValue() * this.subtotal.getValue() / subtotal;
  }

  calculateTip(subtotal, tax) {
    if (this.tipBasis.getValue().description == "Gross") {
      subtotal += tax;
    }
    return subtotal * this.tipPercent.getValue() / 100;
  }
}
