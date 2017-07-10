import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Order} from '../model/order';
import {NgbAccordion} from '@ng-bootstrap/ng-bootstrap';
import {NgbPanel} from '@ng-bootstrap/ng-bootstrap';
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
  settingsSub: Subscription;
  orders: Order[] = [];
  settings: Settings;

  constructor(svc: DataStoreService) {
    this.service = svc;
  }

  ngOnInit() {
    this.settingsSub = this.service.settings.subscribe(obj => this.settings = obj);
    const obs = this.service.getOrders();
    this.orderSub = obs.subscribe(outer => {
      console.log('loading orders: ' + JSON.stringify(outer));
      outer.map(inner => {
        const newOrder = Object.assign({}, inner);
        newOrder.key = inner.$key;
        console.log('loading inner: ' + JSON.stringify(newOrder));
        newOrder.name = inner.name;
        newOrder.paid = inner.paid;
        this.orders.push(newOrder);
        console.log('orders.length=' + this.orders.length);
      })
    });
  }

  ngOnDestroy() {
    this.orderSub.unsubscribe();
  }

  addOrder() {
    this.service.addOrder();
  }

  onRemove(event: Event, index: number) {
    this.service.removeOrder(this.service.Orders[index].key);
  }
}
