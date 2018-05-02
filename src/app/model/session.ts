
import { DataStoreService } from '../data-store/data-store.service';
import { ItemType } from './itemType';
import { OrderType } from '../model';
import { Helpers } from './helpers';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Settings } from './settings';

export class KeyValuePair {
  name: string;
  value: number;
  pattern: string;

  constructor(name: string, value: number, pattern?: string) {
    this.name = name;
    this.value = value;
    this.pattern = pattern;
  }
}
export class Session {

  private _totals: KeyValuePair[];
  private service: DataStoreService;
  public title = 'Split the Check';
  public ready: BehaviorSubject<boolean>;
  public orders: OrderType[] = [];
  public items: ItemType[];
  public helpers: Helpers;
  public settings: Settings;

  constructor(private svc: DataStoreService, settings: Settings, orders: OrderType[], items: ItemType[], helpers: Helpers) {
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

  public get totals(): KeyValuePair[] {
    return this.buildTotals();
  }

  private buildSession(): Promise<void> {
    return new Promise(() => {
      this.ready = new BehaviorSubject<boolean>(true);
    });
  }

  // Flatten the tallies so they can be presented
  // in a tabular format
  //
  private buildTotals(): KeyValuePair[] {
    const result = [];
    result.push(new KeyValuePair('Orders', this.orders.length, '1.0'));
    result.push(new KeyValuePair('Subtotal', this.subtotal, '1.2-2'));
    result.push(new KeyValuePair('Sales Tax', this.tax, '1.2-2'));
    result.push(new KeyValuePair('Tip', this.tip, '1.2-2'));
    result.push(new KeyValuePair('Delivery', this.delivery, '1.2-2'));
    result.push(new KeyValuePair('Total', this.total, '1.2-2'));
    result.push(new KeyValuePair('Paid', this.paid, '1.2-2'));
    result.push(new KeyValuePair('Over / Short', (0 - this.overShort), '1.2-2'));
    return result;
  }
}
