import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Order} from './model/order';
import {OrderService} from "./order.service";

@Component({
  selector: '[order-outlet]',
  templateUrl: './order.component.html'
})

export class OrderComponent {
  @Input() order: Order;
  @Input() index: number;
  @Output() onRemove = new EventEmitter<number>();
  @Output() changeTrigger = new EventEmitter();

  constructor(private orderService: OrderService) {
  }

  addItem() {
    this.orderService.addItem(this.order);
  }

  removeOrder() {
    this.onRemove.emit(this.index);
  }

  updatePaid() {
    this.orderService.calculateOrder(this.order);
  }

  // When an item is changed or removed
  // recalculate the tax, tip and deliver
  // allocated to the order
  changeOrder(changeValue: number) {

  }
}
