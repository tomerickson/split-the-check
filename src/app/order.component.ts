import {Component, Input, Output, EventEmitter} from "@angular/core";
import {Order} from "./model/order";
import {HeaderService} from "./header.service";
import {OrderService} from "./order.service";
import {Header} from "./model/header";
import {BehaviorSubject} from "rxjs";

@Component({
  selector: 'order-outlet',
  templateUrl: './order.component.html',
  styleUrls: ['order.component.scss']
})

export class OrderComponent {
  _order: Order;
  get order() {
    return this._order;
  }

  set order(value) {
    this._order = value;
  }
  @Input() index: number;
  @Output() onRemove = new EventEmitter<Order>();
  @Output() changeTrigger = new EventEmitter();
  paid: number;

  constructor(private service: HeaderService) {
    this._order = new Order(service);
  }

  removeOrder() {
    this.onRemove.emit(this._order);
  }

  updatePaid(value: number) {
    this.order.paid = value;
  }

  // When an item is changed or removed
  // recalculate the tax, tip and deliver
  // allocated to the order
  changeOrder(changeValue: number) {

  }
}
