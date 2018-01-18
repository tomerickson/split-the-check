import { DataStoreService } from '../data-store/data-store.service';
import { OrderBase} from './orderbase';
import { Item } from './item';
import { Helpers } from './helpers';
import { Settings } from './settings';

export class Order implements OrderBase {
  key: string;
  name: string;
  paid: number;
  items: Item[];
  helpers: Helpers;

  private service: DataStoreService;
  private settings: Settings;

  constructor(public orderId: string,
               private svc: DataStoreService,
              private set: Settings,
              private hlp: Helpers) {
    this.service = svc;
    this.settings = set;
    this.helpers = hlp;
  }

  get subtotal(): number {
    return this.items.map(item => item.quantity * item.price)
      .reduce((sum, vlu) => sum + vlu, 0);
  }

  get tax(): number {
    return this.helpers.tax(this.subtotal, this.settings);
  }

  get tip(): number {
    // return Helpers.tip(this.subtotal, this.tax, Helpers.unwrap(this.service.settings));
    return this.helpers.tip(this.subtotal, this.tax, this.settings);
  }

  get delivery(): number {
    return this.helpers.delivery(this.subtotal, this.helpers.unwrap(this.service.subtotal), this.settings);
    }

  get total(): number {
    return this.helpers.total(this.subtotal, this.tax, this.tip, this.delivery);
  }

  get overShort(): number {
    return this.helpers.overShort(this.total, this.paid, this.settings, true);
  }
}
