/**
 * Created by Erick on 3/7/2017.
 */
import {HttpModule, Response, Headers, RequestOptions, Http} from "@angular/http";
import "rxjs/Rx";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Injectable} from "@angular/core";
import {TipBasis} from "./model/tip-basis";
import {ChangeBasis} from "./model/change-basis";
import {Order} from "./model/order";
import {Header} from "./model/header";
import {map} from "rxjs/operator/map";
import {Subscription} from "rxjs";
import {IDefault} from "./model/IDefault";

@Injectable()

export class HeaderService {

  private readonly settingsUrl = "./assets/data/settings.json";
  private readonly  totalsUrl = "./assets/data/totals.json";

  private httpHeaders: Headers;
  private options: RequestOptions;
  taxPercent: BehaviorSubject<number>;
  tipPercent: BehaviorSubject<number>;
  private taxAmount: Observable<number>;
  private tipAmount: Observable<number>;
  private delivery: BehaviorSubject<number>;
  private subTotal: BehaviorSubject<number>;
  private total: Observable<number>;
  public tipBasis: BehaviorSubject<TipBasis>;
  public chgBasis: BehaviorSubject<ChangeBasis>;
  private tipBases: BehaviorSubject<TipBasis[]>;
  private changeBases: BehaviorSubject<ChangeBasis[]>;
  private orders: BehaviorSubject<Order[]>;

  constructor(private http: Http) {
    this.httpHeaders = new Headers();
    this.httpHeaders.append("content-type", "application/json");
    this.options = new RequestOptions({headers: this.httpHeaders});
    this.orders = new BehaviorSubject<Order[]>(null);

    this.taxPercent = new BehaviorSubject<number>(0);
    this.tipPercent = new BehaviorSubject<number>(0);
    this.delivery = new BehaviorSubject<number>(0);
    this.subTotal = new BehaviorSubject<number>(0);
    // this.tipBasis = new BehaviorSubject<TipBasis>(null);
    // this.chgBasis = new BehaviorSubject<ChangeBasis>(null);
    this.tipBases = new BehaviorSubject<TipBasis[]>(null);
    this.changeBases = new BehaviorSubject<ChangeBasis[]>(null);

    this.subscribeToSetting(this.taxPercent, "salesTaxPercent");
    this.subscribeToSetting(this.tipPercent, "tipPercent");
    this.subscribeToSetting(this.delivery, "delivery");
    this.subscribeToList(this.tipBases, "tipBases");
    this.subscribeToList(this.changeBases, "changeBases");
    this.subscribeToDefault(this.tipBasis, "tipBases");
    this.subscribeToDefault(this.chgBasis, "changeBases");

    this.taxAmount = Observable.combineLatest(this.subTotal, this.taxPercent)
      .map(([amt, pct]) => {
        return (amt + (amt * pct / 100));
      });
    this.tipAmount = Observable.combineLatest(this.subTotal, this.taxAmount, this.tipPercent, this.tipBasis)
      .map(([sub, tax,  pct, basis]) => {
        return (basis.value == 1) ? sub * pct / 100 : (sub + tax) * pct / 100;
      });
    this.total = Observable.combineLatest(this.subTotal, this.taxAmount, this.tipAmount, this.delivery)
      .map(([sub, tax, tip, del]) => {
        return sub + tax + tip + del;
      });
  }

  getTipBases() {
    return this.tipBases;
  }

  getChangeBases() {
    return this.changeBases.asObservable();
  }

  // Create the subscriptions for the settings
  //
  private subscribeToSetting(subscriber: BehaviorSubject<number>, node: string): void {
    this.http.get(this.settingsUrl, this.options)
      .map((res) => {
        console.log(res.json());
        console.log(res.json().settings[node]);
        return res.json().settings[node];
      })
      .subscribe(result => subscriber.next(result));
  }

  private subscribeToList(subscriber: BehaviorSubject<any>, list: string): void {
    this.http.get(this.settingsUrl, this.options)
      .map((res) => {
        return res.json()[list];
      })
      .subscribe(result => subscriber.next(result));
  }

  private subscribeToDefault(subscriber: BehaviorSubject<any>, list: string): void {
    this.http.get(this.settingsUrl, this.options)
      .map((res) => {
        return res.json()[list].filter((item: IDefault) => {return item.isDefault === true});
      })
  }

  private subscribeToTotal(subscriber: BehaviorSubject<number>, node: string): void {
    this.http.get(this.totalsUrl, this.options)
      .map((res) => {
        return res.json().totals[node];
      })
      .subscribe(result => subscriber.next(result));
  }

  getSalesTaxPercent(): Observable<number> {
    return this.taxPercent.asObservable();
  }

  setSalesTaxPercent(value: number) {
    this.taxPercent.next(value);
  }

  getDelivery(): Observable<number> {
    return this.delivery
  }

  setDelivery(value: number) {
    this.delivery.next(value);
  }

  getTax(): Observable<number> {
    return this.taxAmount;
  }

  getTip(): Observable<number> {
    return this.tipAmount;
  }

  getTipPercent(): Observable<number> {
    return this.tipPercent.asObservable();
  }

  setTipPercent(value: number) {
    this.tipPercent.next(value);
  }

  setTipBasis(value: TipBasis){
    this.tipBasis.next(value);
  }

  setChangeBasis(value: ChangeBasis) {
    this.chgBasis.next(value);
  }

  getSubTotal(): Observable<number> {
    return this.subTotal.asObservable();
  }

  setSubTotal(subTotal: number) {
    this.subTotal.next(subTotal);
  }

  getTotal(): Observable<number> {
    return this.total;
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
}
