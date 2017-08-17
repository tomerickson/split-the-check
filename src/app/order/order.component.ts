import {Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges} from '@angular/core';
import {Order} from '../model/order';
import {DataStoreService} from '../data-store/data-store.service';
import {Session} from '../model/session';
import {Subscription} from 'rxjs/Subscription';
import {Settings} from '../model/settings';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/defaultIfEmpty';
import {Item} from '../model/item';

@Component({
  selector: 'app-order-outlet',
  templateUrl: './order.component.html',
  styleUrls: ['order.component.scss']
})

export class OrderComponent implements OnInit, OnDestroy, OnChanges {

  // @Input() order: Order;
  @Input() orderId: string;
  @Input() index: number;
  @Output() onRemove = new EventEmitter<Order>();
  @Output() changeTrigger = new EventEmitter();

  session: Session;
  settings: Settings;
  order: Order;
  items: Observable<Item[]>;
  subtotal: number;
  tax: number;
  tip: number;
  delivery: number;
  total: number;
  overShort: number;
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
    // this.settings = this.service.settings.map(obs => this.settings = obs.$value);
    this.orderSubscription = this.service.getOrder(this.orderId).subscribe(obs => this.order = obs);
    this.settingsSubscription = this.service.settings.subscribe(obs => {
      this.settings = obs;
      this.buildOrder(this.items)});
    this.changeBasisSubscription = this.service.changeBasis.subscribe(obs => {
      this.settings.changeOption = obs;
      this.buildOrder(this.items)});
    this.sessionSubscription = this.service.session.subscribe(obs => this.session = obs);
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
    if (!items) return;
    this.items = items;
    this.subtotal = items.map(item => {
      if (item.quantity && item.price) {
        return item.quantity * item.price;
      }
      return 0;
    })
      .reduce((total, value) => total + value, 0);
    this.tax = this.subtotal * this.settings.taxPercent / 100;
    {
      let amt = this.subtotal;
      if (this.settings.tipOption.description === 'Gross') {
        amt += this.tax;
      }
      this.tip = amt * this.settings.tipPercent / 100;
    }
    if (this.settings.delivery > 0 && this.session.subtotal > 0) {
      this.delivery = this.settings.delivery * this.subtotal / this.session.subtotal;
    } else {
      this.delivery = 0;
    }
    this.total = this.subtotal + this.tax + this.tip + this.delivery;
    this.overShort = Math.round((this.total - this.order.paid)
      / this.settings.changeOption.value) * this.settings.changeOption.value;
  }

  removeOrder() {
    this.service.removeOrder(this.orderId);
    return this.service.getItems(this.orderId).map((array) => array.map((element) => element.key = element.$key));
  }

  updateName(event) {
    this.service.updateOrder(this.orderId, {name: (<HTMLInputElement>event.target).value})
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
