import { Component, OnDestroy, OnInit } from '@angular/core';
import { Helpers, ItemBase, OrderBase, Settings } from '../model';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/zip'
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-order-totals',
  templateUrl: 'order-totals.component.html',
  styleUrls: ['./order-totals.component.scss']
})

export class OrderTotalsComponent implements OnInit, OnDestroy {

  settings: Settings;
  helpers: Helpers;
  subscriptions: Subscription[] = [];
  service: DataStoreService;
  subSettings: Subscription;
  orders: OrderBase[];
  items: ItemBase[];
  subtotal: number;
  tax: number;
  tip: number;
  delivery: number;
  total: number;
  paid: number;
  overShort: number;
  underPaid: boolean;

  constructor(svc: DataStoreService, hlp: Helpers) {
    this.service = svc;
    this.helpers = hlp;
    this.initialize();
  }

  ngOnInit() {
    this.initialize();
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  initialize() {
    this.subscribeAll();
  }

  subscribeAll() {
    this.subscriptions.push(this.service.allOrders.subscribe(obs => {
      this.orders = obs;
      let amt = 0;
      this.orders.forEach(ord => amt += ord.paid);
      this.paid = amt;
    }));
    this.subscriptions.push(this.service.allItems
      .subscribe(obs => {
        this.items = obs;
        this.subtotal = Helpers.subtotal(this.items);
        this.tax = Helpers.tax(this.subtotal, this.service.settings);
        this.tip = Helpers.tip(this.subtotal, this.tax, this.service.settings);
        this.delivery = Helpers.delivery(this.subtotal, this.subtotal, this.service.settings);
        this.total = Helpers.total(this.subtotal, this.tax, this.tip, this.delivery);
        this.overShort = Helpers.overShort(this.total, this.paid, this.service.settings, false);
        this.underPaid = this.overShort > 0;
      }));
  }

  unsubscribeAll() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  // const promise = new Promise<void>(() => {});
  // this.subSettings = this.service.settings.subscribe(() => this.settings);
  /*this.session = Observable.zip(this.service.allOrders, this.service.allItems,
    this.service.settings, (ord, itm, settings) =>
      new Session(ord, itm, settings, this.helpers));*/
  /*this.subSettings = this.service.settings.subscribe(() => this.settings);
  const promise: Promise<void> = new Promise(() => {});
promise.then(() =>
      this.subSession = Observable.zip(this.service.allOrders, this.service.allItems,
        this.service.settings, (ord, itm, settings) => {
          return Observable.of( new Session(ord, itm, settings, this.helpers));
        }).subscribe(obs => this.session);*/

  // return promise;

  clearOrder(e: Event) {
    this.service.wrapUp();
    e.preventDefault();
  }
}
