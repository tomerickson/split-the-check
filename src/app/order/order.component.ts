import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from '@angular/core';
import {Order} from '../model/order';
import {DataStoreService} from '../data-store/data-store.service';
import {Session} from '../model/session';
import {Subscription} from 'rxjs/Subscription';
import {Settings} from '../model/settings';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-order-outlet',
  templateUrl: './order.component.html',
  styleUrls: ['order.component.scss']
})

export class OrderComponent implements OnInit, OnDestroy {

 // @Input() order: Order;
  @Input() orderId: string;
  @Input() index: number;
  @Output() onRemove = new EventEmitter<Order>();
  @Output() changeTrigger = new EventEmitter();

  session: Observable<Session>;
  settings: Observable<Settings>;
  order: Observable<Order>;
  delivery: Observable<number>;
  sessionSubscription: Subscription;
  settingsSubscription: Subscription;

  constructor(public service: DataStoreService) {
    this.order = null;
  }

  ngOnInit() {
    this.session = this.service.session.map(obs => this.session = obs.$value);
    this.settings = this.service.settings.map(obs => this.settings = obs.$value);
    this.order = Observable.of(new Order(this.orderId, this.service, this.settings, this.session));
  }

  ngOnDestroy() {
    this.sessionSubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
  }

  removeOrder() {
    this.service.removeOrder(this.orderId);
  }

  updateName(event) {
    this.service.updateOrder(this.orderId, {name: (<HTMLInputElement>event.target).value})
  }

  updatePaid(event) {
    const paid: number = +(<HTMLInputElement>event.target).value;
    this.service.updateOrder(this.orderId, {paid: paid})
  }

  addItem() {
    this.service.addItem(this.orderId);
  }
}
