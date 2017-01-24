import { Component, Input } from '@angular/core';
import { Order } from './model/order';

@Component({
    selector: '[order-outlet]',
    templateUrl: './order.component.html'
})

export class OrderComponent {
    @Input() order: Order = null;
    @Input() index: Number;
}