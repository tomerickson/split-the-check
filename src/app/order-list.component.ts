import {Component, Input} from "@angular/core";
import {Order} from "./model/order";
import {HeaderService} from "./header.service";
import {Header} from "./model/header";
import {BehaviorSubject, Observable} from "rxjs";

@Component({
  selector: 'order-list-outlet',
  styles: ['table {border: 1px solid black;border-collapse: separate}'],
  styleUrls: ["order-list.component.scss"],
  templateUrl: './order-list.component.html'
})

export class OrderListComponent {
  @Input() header: Header;
  orders: Observable<Order[]>;
  constructor(private service: HeaderService) {
    this.orders = service.getOrders();
  }

  addOrder() {
    this.orders = this.service.addOrder();
  }

  onRemove(order: Order) {
    this.orders = this.service.removeOrder(order);
  }
}
