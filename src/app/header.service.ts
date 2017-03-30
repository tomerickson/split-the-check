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
import {IDefault} from "./model/IDefault";
import {ArrayObservable} from "rxjs/observable/ArrayObservable";
import {Observable, Subscription} from "rxjs";

@Injectable()

export class HeaderService {

  private readonly settingsUrl = "./assets/data/settings.json";
  private readonly totalsUrl = "./assets/data/totals.json";

  private httpHeaders: Headers;
  private options: RequestOptions;
  taxPercent: BehaviorSubject<number>;
  tipPercent: BehaviorSubject<number>;
  private _tipBasis: TipBasis;
  private _chgBasis: ChangeBasis;
  private _delivery: number;
  private tipBases: BehaviorSubject<TipBasis[]>;
  private changeBases: BehaviorSubject<ChangeBasis[]>;
  private _orders: Order[];
  private orders: BehaviorSubject<Order[]>;
  tipBasis: BehaviorSubject<TipBasis>;
  chgBasis: BehaviorSubject<ChangeBasis>;

  constructor(private http: Http) {
    this.httpHeaders = new Headers();
    this.httpHeaders.append("content-type", "application/json");
    this.options = new RequestOptions({headers: this.httpHeaders});
    this._orders = [];
    this.orders = new BehaviorSubject<Order[]>(this._orders);

    this.taxPercent = new BehaviorSubject<number>(0);
    this.tipPercent = new BehaviorSubject<number>(0);
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
    this.taxPercent.unsubscribe();
    this.tipPercent.unsubscribe();
    this.tipBases.unsubscribe();
    this.changeBases.unsubscribe();
  }

  get subtotal() {
    let amt = 0;
    for (let order of this._orders) {
      amt += order.subtotal;
    }
    return amt;
  }

  get tax() {
    let amt = 0;
    for (let order of this._orders) {
      amt += order.subtotal;
    }
    return amt * this.taxPercent.getValue() / 100;
  }

  get tip() {
    let amt = 0;
    for (let order of this._orders) {
      amt += order.subtotal;
    }
    if (amt == 0) {
      return 0;
    }
    let basis:TipBasis = this.tipBasis.getValue();
    if (basis.description == "Gross") {
      amt += this.tax;
    }
    return amt * this.tipPercent.getValue() / 100;
  }

  get total() {
    return this.subtotal + this.tax + this.tip + this.delivery;
  }

  get paid() {
    let amt = 0;
    for (let order of this._orders) {
      amt += order.paid;
    }
    return amt;
  }

  get overShort() {
    let amt = 0;
    for (let order of this._orders) {
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

  set delivery(value: number) {
    this._delivery = value;
  }

  get delivery() {
    return this._delivery;
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

  set changeBasis(value: ChangeBasis) {
    this._chgBasis = value;
  }

  getOrders(): Observable<Order[]> {
    return this.orders.asObservable();
  }

  addOrder(): Observable<Order[]> {
    let myOrders: Order[];
    myOrders = this.orders.getValue();
    myOrders.push(new Order(this));
    this.orders.next(myOrders);
    return this.orders.asObservable();
  }

  removeOrder(order: Order): Observable<Order[]> {
    let myOrders: Order[];
    myOrders = this.orders.getValue();
    myOrders.slice(myOrders.indexOf(order), 1);
    this.orders.next(myOrders);
    return this.orders.asObservable();
  }

  calculateDelivery(subtotal) {
    if (subtotal == 0) {
      return 0;
    }
    return this.delivery * this.subtotal / subtotal;
  }

  calculateTip(subtotal, tax) {
    if (this.tipBasis.getValue().description == "Gross") {
      subtotal += tax;
    }
    return subtotal * this.tipPercent.getValue() / 100;
  }
}
