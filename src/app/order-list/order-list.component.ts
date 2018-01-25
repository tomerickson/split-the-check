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

  constructor(svc: DataStoreService) {
    this.service = svc;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  addOrder() {
    this.service.addOrder(new OrderBase());
  }

  onRemove(event: Event, index: number) {
    this.service.removeOrder(this.service.allOrders[index].key);
  }
}

