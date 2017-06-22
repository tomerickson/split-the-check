import {Component, Input, Output, EventEmitter} from "@angular/core";
import {Order} from "../model/order";
import {OrderService} from "../order-service/order-service.service";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'order-outlet',
  templateUrl: './order.component.html',
  styleUrls: ['order.component.scss']
})

export class OrderComponent {

  @Input() order: Observable<Order>;
  @Input() orderId: string;
  @Input() index: number;
  @Output() onRemove = new EventEmitter<Order>();
  @Output() changeTrigger = new EventEmitter();

  service: OrderService;

  constructor(service: OrderService) {
    if (this.order) {
      this.service.fetch(this.orderId);
    }
    else {
      this.service.fetch();
    }
  }

  removeOrder() {
    this.service.removeOrder(this.orderId);
  }

  updatePaid(paid) {
    this.service.setPaid(paid, this.orderId);
  }
}
