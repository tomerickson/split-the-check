import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { Order } from '../model';
import { Session } from '../model';
import { Settings } from '../model';
import { Item } from '../model';
import { Helpers } from '../model';
import 'rxjs/add/operator/defaultIfEmpty';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

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
  order: BehaviorSubject<Order>;
  items: Observable<Item[]>;
  count: Observable<number>;
  subtotal: Observable<number>;
  tax: Observable<number>;
  tip: Observable<number>;
  delivery: Observable<number>;
  total: Observable<number>;
  paid: Observable<number>;
  overShort: Observable<number>;
  positive: Observable<boolean>;
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
    this.orderSubscription = this.service.getOrder(this.orderId).subscribe(() => this.order);
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

    this.delivery = Observable.combineLatest(this.subtotal,
      (amt) => Helpers.calculateDelivery(this.session.subtotal, amt, this.session.delivery));

    this.total = Observable.combineLatest(this.subtotal, this.tax, this.tip, this.delivery,
      (amt, tax, tip, delivery) => amt + tax + tip + delivery);

    this.overShort = Observable.combineLatest(this.total, this.order, this.service.changeOption,
      (total, order, changeOption) => Helpers.calculateOverShort(total, order.paid, changeOption));
    this.positive = Observable.combineLatest(this.overShort, Observable.of(0),
  (overShort, zero) => overShort > zero);
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
