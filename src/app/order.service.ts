import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs";

import "rxjs/Rx";
import {Order} from "./model/order";
import {Item} from "./model/item";
import {TipBasis} from "./model/tip-basis";
import {ChangeBasis} from "./model/change-basis";
import {Settings} from "./model/settings";
import {Totals} from "./model/totals";

@Injectable()

export class OrderService {

  /* Tip Basis dropdown values */
  public tipBases: Array<TipBasis>;

  public changeBases: Array<ChangeBasis>;

  private settingsUrl = "./assets/data/settings.json";
  private totalsUrl = "./assets/data/totals.json";
  totals: Totals;
  settings: Settings;

  constructor(private http: Http) {
  }

  private static handleError(error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = error.status + ' - ' + (error.statusText || '') + ' ' + err;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  getTotals(): Observable<Totals> {
    return this.http.get(this.totalsUrl)
      .map(res => res.json().totals)
      .catch(err => OrderService.handleError(err));
  }

  getSettings() : Observable<Settings> {
    return this.http.get(this.settingsUrl)
      .map(res  => res.json())
      .catch((err: any) => OrderService.handleError(err));
  }

  getTipBases(): Observable<TipBasis[]> {
    return this.http.get(this.settingsUrl)
      .map(res => res.json().tipBases)
      .catch(err => OrderService.handleError(err))
  }

  getChangeBases(): Observable<ChangeBasis[]> {
    return this.http.get(this.settingsUrl)
      .map(res => res.json().changeBases)
      .catch(err => OrderService.handleError(err))
  }

  public addOrder(): void {
    this.totals.Orders.push(new Order(this.settings, this.totals));
  }

  public removeOrder(index: number) {
    let orders: Order[] = this.totals.Orders;
    orders.splice(index, 1);
    this.totals.Orders = orders;
  }

  public static addItem(order: Order) {
    order.items.push(new Item());
  }

  public static removeItem(order: Order, index: number) {
    order.items.splice(index, 1);
  }

  public getOrders(): Order[] {
    return this.totals.Orders;
  }

  public static getItems(order: Order) {
    return order.items;
  }

  calculateOrder(order: Order) {
    let orderValue: number = 0;
    for (let item of order.items) {
      orderValue += item.price * item.quantity;
    }
    this.calculateChange(order);
  }

  calculateChange(order: Order) {
    let due = order.subtotal + +order.tax + order.tip + order.delivery;
    let overShort = order.paid - due;
    order.overShort = Math.round(overShort / this.settings.changeBasis) * this.settings.changeBasis;
  }
}
