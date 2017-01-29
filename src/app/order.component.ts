import {Component, Input, Output, EventEmitter} from '@angular/core';
import { Order } from './model/order';
import {Item} from "./model/item";
import {OrderService} from "./order.service";

@Component({
    selector: '[order-outlet]',
    templateUrl: './order.component.html'
})

export class OrderComponent {
    @Input() order: Order;
    @Input() index: number;
    @Output() onRemove = new EventEmitter<number>();

    constructor(private orderService: OrderService) {
    }

    addItem() {
        this.orderService.addItem(this.order);
    }

    removeOrder() {
      this.onRemove.emit(this.index);
    }
}
