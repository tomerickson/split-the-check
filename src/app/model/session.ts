import {IItem, IOrder} from './index';
import {DataStoreService} from '../data-store/data-store.service';
import { OnDestroy, OnInit } from '@angular/core';
import {Helpers} from './helpers';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';

export class Session implements OnInit, OnDestroy {

  public title = 'Split the Check';
  public items: IItem[];
  public orders: IOrder[];

  private itemsSubscription: Subscription;
  private ordersSubscription: Subscription;

  constructor(public service: DataStoreService) {
  }

  get subtotal(): number {
    let result = 0;
    this.items.forEach(item => result += (item.quantity * item.price));
    return result;
  }

  get tax(): number {
    return this.subtotal * this.service.taxPercent.getValue() / 100;
  }

  get tip(): number {
    return Helpers.calculateTip(this.subtotal, this.service.tipOption.getValue(), this.tax, this.service.tipPercent.getValue());
  }

  get delivery(): number {
    return this.service.delivery.getValue();
  }

  get total(): number {
    return this.subtotal + this.tax + this.tip + this.delivery;
  }

  get paid(): number {
    let result = 0;
    this.orders.forEach(order => result += order.paid);
    return result;
  }

  // Round the total to the nearest penny before
  // calculating change
  //
  get overShort(): number {
    return Math.round((this.total * 100) / 100) - this.paid;
  }

  ngOnInit() {
    this.itemsSubscription = this.service.allItems.subscribe(items => this.items = items);
    this.ordersSubscription = this.service.allOrders.subscribe(orders => this.orders = orders);
  }
  ngOnDestroy() {
    this.itemsSubscription.unsubscribe();
    this.ordersSubscription.unsubscribe();
  }
}
