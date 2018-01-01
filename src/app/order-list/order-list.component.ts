import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Order} from '../model/order';
import {DataStoreService} from '../data-store/data-store.service';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {Settings} from '../model/settings';
import {Session} from '../model/session';
import { IOrder } from '../model';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-order-list-outlet',
  styleUrls: ['order-list.component.scss'],
  templateUrl: 'order-list.component.html'
})

export class OrderListComponent implements OnInit, OnDestroy {
  @Input() settings: Settings;
  @Input() session: Session;
  service: DataStoreService;
  subscriptions: Subscription[] = [];
  orders: IOrder[];

  constructor(svc: DataStoreService) {
    this.service = svc;
  }

  ngOnInit() {
    this.subscriptions.push(this.service.allOrders.subscribe(obs => this.orders = obs));
    if (isNullOrUndefined(this.settings)) {debugger; }
    if (isNullOrUndefined(this.session)) {debugger; }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  addOrder() {
    this.service.addOrder();
  }

  onRemove(event: Event, index: number) {
    this.service.removeOrder(this.service.allOrders[index].key);
  }
}
