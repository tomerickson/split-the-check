import { Component, Input, OnDestroy, OnInit} from '@angular/core';
import { DataStoreService} from '../data-store/data-store.service';
import { Observable} from 'rxjs/Observable';
import { Subscription} from 'rxjs/Subscription';
import { OrderBase, Order, Settings, Session} from '../model';
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
  orders: OrderBase[];

  constructor(svc: DataStoreService) {
    this.service = svc;
  }

  ngOnInit() {
    const promise: Promise<void> = new Promise<void>(() =>
      this.subscriptions.push(this.service.allOrders.subscribe(obs => this.orders = obs)));
    promise
      .catch(err => console.error(err))
    }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  addOrder() {
    this.service.addOrder(new OrderStub());
  }

  onRemove(event: Event, index: number) {
    this.service.removeOrder(this.service.allOrders[index].key);
  }
}

class OrderStub implements OrderBase {
  key: string;
  orderId: string;
  name: string;
  paid: number;
  items: null
}
