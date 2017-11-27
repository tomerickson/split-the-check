import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Order} from '../model/order';
import {DataStoreService} from '../data-store/data-store.service';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {Settings} from '../model/settings';
import {Session} from '../model/session';

@Component({
  selector: 'app-order-list-outlet',
  styleUrls: ['order-list.component.scss'],
  templateUrl: 'order-list.component.html'
})

export class OrderListComponent implements OnInit, OnDestroy {
  service: DataStoreService;
  orderSub: Subscription;
  orders: Order[];

  constructor(svc: DataStoreService) {
    this.service = svc;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  addOrder() {
    this.service.addOrder();
  }

  onRemove(event: Event, index: number) {
    this.service.removeOrder(this.service.allOrders[index].key);
  }
}
