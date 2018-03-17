
import { DataStoreService } from '../data-store/data-store.service';
import { ItemBase } from './itembase';
import { OrderBase } from '../model';
import { Helpers } from './helpers';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Settings } from './settings';

export class Session {

  private _totals: {name: string, value: number}[] = [];
  private service: DataStoreService;
  public title = 'Split the Check';
  public ready: BehaviorSubject<boolean>;
  public orders: OrderBase[] = [];
  public items: ItemBase[];
  public helpers: Helpers;
  public settings: Settings;

  constructor(private svc: DataStoreService, settings: Settings, orders: OrderBase[], items: ItemBase[], helpers: Helpers) {
    this.service = svc;
    this.orders = orders;
    this.items = items;
    this.settings = settings;
    this.helpers = helpers;
    this.buildSession()
      .then( () => {}, err => console.error(`session constructor failed: ${err}`));
  }

  public get subtotal(): number {
    if (this.items && this.items.length > 0) {
      return Helpers.subtotal(this.items);
    } else {
      return 0;
    }
  }

  public get tax(): number {
    return Helpers.tax(this.subtotal, this.settings);
  }

  public get tip(): number {
    return Helpers.tip(this.subtotal, this.tax, this.settings);
  }

  public get delivery(): number {
    return Helpers.delivery(this.subtotal, this.subtotal, this.settings);
  }

  public get total(): number {
    return Helpers.total(this.subtotal, this.tax, this.tip, this.delivery);
  }

  public get paid(): number {
    return this.orders.map(ord => ord.paid)
      .reduce((sum, vlu) => sum + vlu, 0);
  }

  public get overShort(): number {
    return Helpers.overShort(this.total, this.paid, this.settings, false);
  }

  /* public get underPaid(): boolean {
    return this.overShort > 0;
  }*/

  public get totals(): {name: string, value: number}[] {
    return this._totals;
  }

  private buildSession(): Promise<void> {
    return new Promise(() => {
      this.buildTotals();
      this.ready = new BehaviorSubject<boolean>(true);
    });
  }

  // Flatten the tallies so they can be presented
  // in a tabular format
  //
  private buildTotals() {
    const result = [];
    result.push({name: 'Orders:', value: this.orders.length});
    result.push({name: 'Subtotal:', value: this.subtotal});
    result.push({name: 'Sales Tax:', value: this.tax});
    result.push({name: 'Tip:', value: this.tip});
    result.push({name: 'Delivery:', value: this.delivery});
    result.push({name: 'Total:', value: this.total});
    result.push({name: 'Paid:', value: this.paid});
    result.push({name: 'Over / Short:', value: this.overShort});
    this._totals = result;
  }
}
