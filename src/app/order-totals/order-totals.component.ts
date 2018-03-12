import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Helpers, ItemBase, Order, Settings } from '../model';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/zip'
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';
import { DialogsService } from '../dialogs/dialogs.service';

@Component({
  selector: 'app-order-totals',
  templateUrl: 'order-totals.component.html',
  styleUrls: ['./order-totals.component.scss']
})

export class OrderTotalsComponent implements OnChanges, OnInit, OnDestroy {

  @Input() settings: Settings;
  @Input() orders: Order[];
  helpers: Helpers;
  subscriptions: Subscription[] = [];
  service: DataStoreService;
  subSettings: Subscription;
  dialogs: DialogsService;
  // orders: OrderBase[];
  items: ItemBase[];
  subtotal: number;
  tax: number;
  tip: number;
  delivery: number;
  total: number;
  paid: number;
  overShort: number;
  underPaid: boolean;

  constructor(svc: DataStoreService, hlp: Helpers, dlg: DialogsService) {
    this.service = svc;
    this.helpers = hlp;
    this.dialogs = dlg;
  }

  ngOnChanges(changes: SimpleChanges) {

    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        const change = changes[propName];

        switch (propName) {
          case 'orders':
            if (change.currentValue) {
              let amt = 0;
              this.orders.forEach(ord => amt += ord.paid);
              this.paid = amt;
            }
            break;
          case 'settings':
            const set: Settings = change.currentValue;
            break;
        }
      }
    }
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

    this.subscriptions.push(this.service.allItems
      .subscribe(obs => {
        this.items = obs;
        this.subtotal = Helpers.subtotal(this.items);
        this.tax = Helpers.tax(this.subtotal, this.settings);
        this.tip = Helpers.tip(this.subtotal, this.tax, this.settings);
        this.delivery = Helpers.delivery(this.subtotal, this.subtotal, this.settings);
        this.total = Helpers.total(this.subtotal, this.tax, this.tip, this.delivery);
        this.overShort = Helpers.overShort(this.paid, this.total, this.settings, false);
        this.underPaid = this.overShort < 0;
      }));
  }

  unsubscribeAll() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  clearOrder(e: Event) {
    const message = 'This action cannot be undone.<br>Are you sure you want to do this?';
    this.dialogs.confirm('Remove all orders?', message)
      .subscribe(res => {
        if (res === true) {
          this.service.wrapUp();
          e.preventDefault();
        }
      });
  }
}
