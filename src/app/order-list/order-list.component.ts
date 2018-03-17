import { Component, Input, NgZone } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';
import { Session, Settings } from '../model';

@Component({
  selector: 'app-order-list-outlet',
  styleUrls: ['order-list.component.scss'],
  templateUrl: 'order-list.component.html'
})

export class OrderListComponent {
  @Input() settings: Settings;
  @Input() session: Session;
  // @Input() orders: OrderBase;
  service: DataStoreService;
  zone: NgZone;
  subscriptions: Subscription[] = [];

  constructor(svc: DataStoreService, zone: NgZone) {
    this.service = svc;
    this.zone = zone;
  }

  onRemove(index: number) {
    this.service.removeOrder(this.service.allOrders[index].key);
  }

  addOrder() {
    this.service.addOrder()
      .then(result => console.log(`order-list.addOrder result = ${result.toJSON()}`));
  }
}

