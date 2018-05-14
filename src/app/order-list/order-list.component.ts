import { AfterViewInit, Component, Input, NgZone, OnInit, QueryList, ViewChildren } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';
import { OrderType, Settings } from '../model';
import { OrderComponent } from '../order/order.component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-order-list-outlet',
  styleUrls: ['order-list.component.scss'],
  templateUrl: 'order-list.component.html'
})

export class OrderListComponent implements OnInit, AfterViewInit {
  @Input() settings: Settings;
  @Input() orders: OrderType[];
  @Input() totals: number;
  @ViewChildren(OrderComponent) children: QueryList<OrderComponent>;

  activeChild: BehaviorSubject<OrderComponent>;
  service: DataStoreService;
  zone: NgZone;
  subscriptions: Subscription[] = [];

  constructor(svc: DataStoreService, zone: NgZone) {
    this.service = svc;
    this.zone = zone;
  }

  ngAfterViewInit() {
    // debugger;
  }

  ngOnInit() {

  }

  onRemove(index: number) {
    this.service.removeOrder(this.service.allOrders[index].key);
  }

  addOrder() {
    this.service.addOrder()
      .then(result => console.log(`order-list.addOrder result = ${result.toJSON()}`));
  }
}

