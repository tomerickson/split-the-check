import { Injectable, OnDestroy } from '@angular/core';
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
  private service: DataStoreService;
  public items: ItemBase[];
  public helpers: Helpers;
  public settings: Settings;
  private subscriptions: Subscription[] = [];

  // private tipOptionSubscription: Subscription;

  constructor(private svc: DataStoreService) {
    this.service = svc;
    this.buildSession();
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
