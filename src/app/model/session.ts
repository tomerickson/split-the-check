import {Order} from './order';
import {Item} from "./item";
import {TipBasis} from "./tip-basis";
import {Settings} from "./settings";
import {DataStoreService} from "../data-store/data-store.service";
import {Subscription} from "rxjs/Subscription";
import {OnDestroy} from "@angular/core";

export class Session implements OnDestroy {
  public title: string = "Split the Check";
  public delivery: number = 0;
  public orders: Order[];
  public items: Item[];
  public settings: Settings;

  private settingsSubscription: Subscription;
  private ordersSubscription: Subscription;
  private itemsSubscription: Subscription;

  constructor(public service: DataStoreService) {
    this.orders = [];
    this.items = [];
    this.ordersSubscription = this.service.AllOrders.subscribe(orders => this.orders = orders);
    this.itemsSubscription = this.service.AllItems.subscribe(items => this.items = items);
    this.settingsSubscription = this.service.settings.subscribe(settings => this.settings = settings);
  }

  ngOnDestroy() {
    this.settingsSubscription.unsubscribe();
    this.ordersSubscription.unsubscribe();
    this.itemsSubscription.unsubscribe();
  }

  get subtotal(): number {
    let amt: number = 0;
    try {
      this.items.forEach(item => {
        amt += item.price * item.quantity;
      });
    }
    catch (err) {
      console.log(err);
    }
    return amt;
  }

  get tax(): number {
    return this.subtotal * this.settings.taxPercent / 100;
  }


  get tip(): number {
    return this.calculateTip(this.subtotal, this.settings.tipOption, this.tax, this.settings.tipPercent);
  }

  get total(): number {
    return this.defaultToZero(this.subtotal + this.tax + this.tip + this.settings.delivery);
  }

  get paid(): number {
    let paid: number = 0;
    this.orders.forEach(order => {
        paid += order.paid;
      }
    );
    return paid;
  }

  calculateTip(subtotal: number, basis: TipBasis, tax: number, pct: number): number {
    let amt = subtotal;
    if (basis.description === 'Gross') {
      amt += tax;
    }
    return amt * pct / 100;
  }

  get overShort(): number {
    return this.total - this.paid;
  }

  defaultToZero(expression) {
    return (!expression) ? 0 : expression;
  }
}
