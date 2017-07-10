import {Order} from './order';
import {Item} from './item';
import {Settings} from './settings';
import {DataStoreService} from '../data-store/data-store.service';
import {Subscription} from 'rxjs/Subscription';
import {OnDestroy} from '@angular/core';
import {Helpers} from './helpers';

export class Session implements OnDestroy {
  public title = 'Split the Check';
  public delivery = 0;
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

  get subtotal(): number {
    return Helpers.tallyPurchaseValue(this.items);
  }

  get tax(): number {
    return this.subtotal * this.settings.taxPercent / 100;
  }

  get tip(): number {
    return Helpers.calculateTip(this.subtotal, this.settings.tipOption, this.tax, this.settings.tipPercent);
  }

  get total(): number {
    return Helpers.defaultToZero(this.subtotal + this.tax + this.tip + this.settings.delivery);
  }

  get paid(): number {
    let paid = 0;
    this.orders.forEach(order => {
        paid += order.paid;
      }
    );
    return paid;
  }

  get overShort(): number {
    return this.total - this.paid;
  }

  ngOnDestroy() {
    this.settingsSubscription.unsubscribe();
    this.ordersSubscription.unsubscribe();
    this.itemsSubscription.unsubscribe();
  }
}
