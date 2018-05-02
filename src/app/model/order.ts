import { DataStoreService } from '../data-store/data-store.service';
import { OrderType } from './orderType';
import { Item } from './item';
import { Helpers } from './helpers';
import { Settings } from './settings';
import { Session } from './session';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core';

export class Order implements OnDestroy, OrderType {
  private _items: Item[] = [];
  private _session: Session;
  private readonly service: DataStoreService;
  private readonly settings: Settings;
  private subscriptions: Subscription[] = [];
  private _total: number;
  private _overShort: number;

  key: string;
  name: string;
  paid: number;
  helpers: Helpers;
  subtotal: number;
  tax: number;
  tip: number;
  delivery: number;
  grandTotal: number;

  get session(): Session {
    return this._session;
  }

  set session(value: Session) {
    this._session = value;
  }

  get items(): Item[] {
    return this._items;
  }

  set items(value: Item[]) {
    this._items = value;
    this.subtotal = Helpers.subtotal(this._items);
    this.tax = Helpers.tax(this.subtotal, this.settings);
    this.tip = Helpers.tip(this.subtotal, this.tax, this.settings);
    this.delivery = Helpers.delivery(this.subtotal, this.grandTotal, this.settings);
    this._total = Helpers.total(this.subtotal, this.tax, this.tip, this.delivery);
    this._overShort = Helpers.overShort(this.total, this.paid, this.settings, true);
  }

  get total(): number {
    return this._total;
  }

  get overShort(): number {
    return this._overShort;
  }

  constructor(private orderId: string,
              private set: Settings,
              private svc: DataStoreService,
              private tot: Observable<number>,
              private hlp: Helpers) {
    this.orderId = orderId;
    this.service = svc;
    this.helpers = hlp;
    this.settings = set;
    tot.map(obs => this.grandTotal = obs);
    this.subscribeAll();
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  subscribeAll() {
    this.subscriptions.push(this.service.getItems(this.orderId)
      .subscribe(items => this.items = items));
  }

  unsubscribeAll() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }
}
