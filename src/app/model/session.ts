import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { DataStoreService } from '../data-store/data-store.service';
import { ItemBase } from './itembase';
import { OrderBase } from '../model';
import { Helpers } from './helpers';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Settings } from './settings';

export class Session implements OnDestroy {

  public title = 'Split the Check';
  public ready: BehaviorSubject<boolean>;
  public orders: OrderBase[];
  public service: DataStoreService;
  public items: ItemBase[];
  private helpers: Helpers;
  private settings: Settings;
  private subscriptions: Subscription[] = [];

  // private tipOptionSubscription: Subscription;

  constructor(private ord: OrderBase[], private itm: ItemBase[], private set: Settings, private hlp: Helpers) {
    this.orders = ord;
    this.items = itm;
    this.helpers = hlp;
    this.settings = set;
  }
  /*constructor(private svc: DataStoreService, private set: Settings, private hlp: Helpers) {
    this.service = svc;
    this.helpers = hlp;
    this.settings = set;
    this.buildSession().then(() => {})
      .catch(err => console.error('Session constructor failed: ' + err.toJSON()));
  }*/

  public get subtotal(): number {
    if (this.items && this.items.length > 0) {
      return this.helpers.subtotal(this.items);
    } else {
      return 0;
    }
  }

  public get tax(): number {
    return this.helpers.tax(this.subtotal, this.settings);
  }

  public get tip(): number {
    return this.helpers.tip(this.subtotal, this.tax, this.settings);
  }

  public get delivery(): number {
    return this.helpers.delivery(this.subtotal, this.subtotal, this.settings);
  }

  public get total(): number {
    return this.helpers.total(this.subtotal, this.tax, this.tip, this.delivery);
  }

  public get paid(): number {
    return this.orders.map(ord => ord.paid)
      .reduce((sum, vlu) => sum + vlu, 0);
  }

  public get overShort(): number {
    return this.helpers.overShort(this.total, this.paid, this.settings, false);
  }

  public get underPaid(): boolean {
    return this.overShort > 0;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private buildSession(): Promise<void> {
    return new Promise(() => {
      this.subscriptions.push(this.service.allOrders.subscribe(obs => this.orders = obs));
      this.subscriptions.push(this.service.allItems.subscribe(obs => this.items = obs));
      this.ready = new BehaviorSubject<boolean>(true);
    });
  }
}
