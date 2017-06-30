import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from "@angular/core";
import {Order} from "../model/order";
import {OrderService} from "../order-service/order-service.service";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'order-outlet',
  templateUrl: './order.component.html',
  styleUrls: ['order.component.scss']
})

export class OrderComponent implements OnInit, OnDestroy {

  @Input() orderId: string;
  @Input() index: number;
  @Output() onRemove = new EventEmitter<Order>();
  @Output() changeTrigger = new EventEmitter();

  order: Order;
  paid: number;
  orderSubscription: Subscription;


  constructor(public service: OrderService) {
  }

  ngOnInit() {
    this.service.initialize(this.orderId);
    this.orderSubscription = this.service.Order.subscribe((order) => this.order = order);
  }

  ngOnDestroy() {
    this.orderSubscription.unsubscribe();
  }

  removeOrder() {
    this.service.removeOrder();
  }

  updateName(name: string) {
    this.service.setName(name);
  }

  updatePaid(paid) {
    this.service.setPaid(paid);
  }
}
