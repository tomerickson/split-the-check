import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Order } from '../model/order';
import { DataStoreService } from '../data-store/data-store.service';
import { Session } from '../model/session';
import { Subscription } from 'rxjs/Subscription';
import { Settings } from '../model/settings';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/defaultIfEmpty';
import { Item } from '../model/item';
import { Helpers, IOrder } from '../model';

@Component({
  selector: 'app-order-outlet',
  templateUrl: './order.component.html',
  styleUrls: ['order.component.scss']
})

export class OrderComponent implements OnInit, OnDestroy, OnChanges {

  @Input() orderId: string;
  @Input() index: number;
  @Output() onRemove = new EventEmitter<Order>();
  @Output() changeTrigger = new EventEmitter();

  session: Session;
  settings: Settings;
  order: Observable<Order>;
  items: Observable<Item[]>;
  count: Observable<number>;
  subtotal: Observable<number>;
  tax: Observable<number>;
  tip: Observable<number>;
  delivery: Observable<number>;
  total: Observable<number>;
  paid: Observable<number>;
  overShort: Observable<number>;
  orderSubscription: Subscription;
  itemsSubscription: Subscription;
  sessionSubscription: Subscription;
  settingsSubscription: Subscription;
  changeBasisSubscription: Subscription;

  constructor(public service: DataStoreService) {
    this.order = null;
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  ngOnInit() {
    this.order = this.service.getOrder(this.orderId);
    this.itemsSubscription = this.service.getItems(this.orderId).subscribe(items => this.buildOrder(items));
  }

  ngOnDestroy() {
    this.orderSubscription.unsubscribe();
    this.sessionSubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
    this.itemsSubscription.unsubscribe();
    this.changeBasisSubscription.unsubscribe();
  }

  buildOrder(items) {
    if (!items) {return};
    this.items = items;
    this.count = items.map(item => 1).reduce((acc, one) => acc + one, 0);
    this.subtotal = items.map(item => {
      if (item.quantity && item.price) {
        return item.quantity * item.price;
      }
      return 0;
    })
      .reduce((total, value) => total + value, 0);
    this.tax = Observable.combineLatest(this.subtotal, this.service.taxPercent,
      (amt, pct) => amt * pct / 100);

    this.tip = Observable.combineLatest(this.subtotal, this.tax, this.service.tipPercent, this.service.tipOption,
      (amt, tax, pct, basis) => Helpers.calculateTip(amt, basis, tax, pct));

    this.delivery = Observable.combineLatest(this.session.subtotal, this.session.delivery, this.subtotal,
      (total, amt, delivery) => Helpers.calculateDelivery(total, amt, delivery));

    this.total = Observable.combineLatest(this.subtotal, this.tax, this.tip, this.delivery,
      (amt, tax, tip, delivery) => amt + tax + tip + delivery);

    this.overShort = Observable.combineLatest(this.total, this.order, this.service.changeOption,
      (total, order, changeOption) => Helpers.calculateOverShort(total, order.paid, changeOption));
  }

  removeOrder() {
    this.service.removeOrder(this.orderId);
    return this.service.getItems(this.orderId);
  }

  updateName(event) {
    const name: string = (<HTMLInputElement>event.target).value;
    this.service.updateOrder(this.orderId, {name: name});
  }

  updatePaid(event) {
    const paid: number = +(<HTMLInputElement>event.target).value;
    this.service.updateOrder(this.orderId, {paid: paid})
  }

  selectPaid(event: Event) {
    const element = <HTMLInputElement>event.target;
    /*const paid: number = +element.value;
    element.value = paid.toFixed(2);*/
    element.select();
  }

  addItem() {
    this.service.addItem(this.orderId);
  }
}
