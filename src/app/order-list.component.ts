import { Component } from '@angular/core';
import { Order } from './model/order';

@Component({
    selector: '[order-list-outlet]',
    styles: ['table {border: 1px solid black;border-collapse: separate}'],
    styleUrls: ['./order-list.component.less'],
    templateUrl: './order-list.component.html'
})

export class OrderListComponent {

    orders: Array<Order>;
    constructor() {
        this.orders = new Array<Order>();
    }

    addOrder() {
        this.orders.push(new Order());
    }
}
