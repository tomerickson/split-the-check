import {Item} from './item';
import {Settings} from './settings';
import {Session} from './session';
import {Subscription} from 'rxjs/Subscription';
import {DataStoreService} from '../data-store/data-store.service';
import {OnDestroy} from '@angular/core';

export class Order implements IOrder, OnDestroy {
  key: string;
  name: string;
  paid: number;
  items: Item[];
  private settings: Settings;
  private session: Session;
  private service: DataStoreService;

  private sessionSubscription: Subscription;
  private settingsSubscription: Subscription;
  private itemsSubscription: Subscription;

  constructor(svc: DataStoreService, orderId: string = '') {
    this.service = svc;
    this.key = orderId;
    this.name = '';
    this.paid = 0;
    this.items = [];
    this.sessionSubscription = this.service.session.subscribe(session => this.session = session);
    this.itemsSubscription = this.service.getItems(orderId).subscribe(items => this.items = items);
    this.settingsSubscription = this.service.settings.subscribe(settings => this.settings = settings);
  }

  ngOnDestroy() {
    this.sessionSubscription.unsubscribe();
    this.itemsSubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
  }

  get count(): number {
    return this.items.length;
  }

  get subtotal(): number {
    return this.items.map(item => item.quantity * item.price)
      .reduce((total, value) => total + value);
  }

  get tax(): number {
    return this.subtotal * this.settings.taxPercent / 100;
  }

  get tip(): number {
    let amt = this.subtotal;
    if (this.settings.tipOption.description === 'Gross') {
      amt += this.tax;
    }
    return amt * this.settings.tipPercent / 100;
  }

  get delivery(): number {
    if (this.session.delivery > 0 && this.session.subtotal > 0) {
      return this.session.delivery * this.subtotal / this.session.subtotal;
    } else {
      return 0;
    }
  }

  get total(): number {
    return this.subtotal + this.tax + this.tip + this.delivery;
  }

  get overShort(): number {
    return Math.round((this.total - this.paid) * this.settings.changeOption.value)
      * this.settings.changeOption.value;
  }
}
