import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { ChangeBasis, IOrder, Order } from '../model';
import { Session } from '../model';
import { Settings } from '../model';
import { IItem } from '../model';
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
  @Input() session: Session;
  @Input() settings: Settings;
  @Output() onRemove = new EventEmitter<Order>();
  @Output() changeTrigger = new EventEmitter();

  name: string;
  paid: number;
  order: IOrder;
  items: IItem[];
  count: number;
  total: number;
  overShort: number;
  positive: boolean;
  changeBasis: ChangeBasis;
  subscriptions: Subscription[];

  constructor(public service: DataStoreService) {
    this.order = null;
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  buildOrder(order) {
    this.order = order;
    this.paid = order.paid;
  }

  fillOrder(items) {
    if (!items) {
      return
    }
  }

  removeOrder() {
    this.service.removeOrder(this.orderId);
    return this.service.getItems(this.orderId);
  }

  updateName(event) {
    this.name = (<HTMLInputElement>event.target).value;
    this.service.updateOrder(this.orderId, {name: this.name, paid: this.paid});
  }

  updatePaid(event) {
    this.paid = +(<HTMLInputElement>event.target).value;
    this.service.updateOrder(this.orderId, {name: this.name, paid: this.paid});
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
