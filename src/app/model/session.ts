import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { DataStoreService } from '../data-store/data-store.service';
import { IItem } from './iitem';
import { IOrder } from './iorder';
import { Helpers } from './helpers';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Settings } from './settings';

export class Session implements OnDestroy {

  public title = 'Split the Check';
  public ready: BehaviorSubject<boolean>;
  public orders: IOrder[];
  public service: DataStoreService;

  private helpers: Helpers;
  private settings: Settings;
  private items: IItem[];
  private subscriptions: Subscription[] = [];
 // private tipOptionSubscription: Subscription;

  constructor(private svc: DataStoreService, private hlp: Helpers) {
    this.service = svc;
    this.helpers = hlp;
    new Promise<void>(() => this.subscriptions.push(this.service.settings.subscribe(obs => {
      this.settings = obs;
    })))
      .then(() => this.subscriptions.push(this.service.allOrders.subscribe(obs => this.orders = obs)))
      .then(() => this.subscriptions.push(this.service.allItems.subscribe(obs => this.items = obs)))
      .then(() => this.ready = new BehaviorSubject<boolean>(true))
      .catch(err => console.error('Session constructor failed: ' + JSON.stringify(err)));
  }

  public get subtotal(): number {
    return this.helpers.subtotal(this.items);
  }

  public get tax(): number {
    return this.helpers.tax(this.subtotal);
  }

  public get tip(): number {
    return this.helpers.tip(this.subtotal, this.tax);
  }

  public get delivery(): number {
    return this.helpers.delivery(this.subtotal, this.subtotal);
  }

  public get total(): number {
    return this.helpers.total(this.subtotal, this.tax, this.tip, this.delivery);
  }

  public get paid(): number {
    return this.orders.map(ord => ord.paid)
      .reduce((sum, vlu) => sum + vlu, 0);
  }

  public get overShort(): number {
    return this.helpers.overShort(this.total, this.paid, false);
  }

  public get underPaid(): boolean {
    return this.overShort > 0;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
