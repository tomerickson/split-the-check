import {Component, Input} from "@angular/core";
import {Order} from "./model/order";
import {OrderService} from "./order.service";

@Component({
  selector: '[order-list-outlet]',
  styles: ['table {border: 1px solid black;border-collapse: separate}'],
  templateUrl: './order-list.component.html'
})

export class OrderListComponent {
  @Input() orders: Order[];

  constructor(private orderService: OrderService) {
  }

  addOrder() {
    this.orderService.addOrder();
    this.orders = this.orderService.getOrders();
  }

  onRemove(index: number) {
    this.orderService.removeOrder(index);
  }
}
