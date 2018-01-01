import { DataStoreService } from '../data-store/data-store.service';
import { IOrder} from './IOrder';
import { Item } from './item';
import { Helpers } from './helpers';

export class Order implements IOrder {
  key: string;
  name: string;
  paid: number;
  items: Item[];
  helpers: Helpers;

  private service: DataStoreService;

  constructor(public orderId: string,
               private svc: DataStoreService,
              private hlp: Helpers) {
    this.service = svc;
    this.helpers = hlp;
  }

  get subtotal(): number {
    return this.items.map(item => item.quantity * item.price)
      .reduce((sum, vlu) => sum + vlu, 0);
  }

  get tax(): number {
    return this.helpers.tax(this.subtotal);
  }

  get tip(): number {
    // return Helpers.tip(this.subtotal, this.tax, Helpers.unwrap(this.service.settings));
    return this.helpers.tip(this.subtotal, this.tax);
  }

  get delivery(): number {
    return this.helpers.delivery(this.subtotal, this.helpers.unwrap(this.service.subtotal));
    }

  get total(): number {
    return this.helpers.total(this.subtotal, this.tax, this.tip, this.delivery);
  }

  get overShort(): number {
    return this.helpers.overShort(this.total, this.paid, true);
  }
}
