import { Component, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';
import { OrderBase, Session, Settings } from '../model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-order-list-outlet',
  styleUrls: ['order-list.component.scss'],
  templateUrl: 'order-list.component.html'
})

export class OrderListComponent implements OnChanges, OnInit, OnDestroy {
  @Input() settings: Settings;
  @Input() session: Session;
  @Input() orders: OrderBase;
  service: DataStoreService;
  zone: NgZone;
  subscriptions: Subscription[] = [];

  constructor(svc: DataStoreService, zone: NgZone) {
    this.service = svc;
    this.zone = zone;
    this.session = new Session(this.service);
    this.subscribeAll();
  }

  ngOnInit() {
    // this.subscribeAll();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        const change: SimpleChange = changes[propName];
        if (change.currentValue && change.currentValue !== change.previousValue) {
        }
      }
    }
  }

  subscribeAll() {
  }

  unsubscribeAll() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  onRemove(event: Event, index: number) {
    this.service.removeOrder(this.service.allOrders[index].key);
  }

  addOrder() {
    const result = this.service.addOrder();
    console.log(`order-list.addOrder result = ${result.toJSON()}`);
  }

  removeOrder(order) {

  }
}

