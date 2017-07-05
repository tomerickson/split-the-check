import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from "@angular/core";
import {Order} from "../model/order";
import {DataStoreService} from "../data-store/data-store.service";
import {Settings} from "../model/settings";
import {Observable} from "rxjs/Observable";

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

  order: Observable<Order>;
  ord: Order;
  settings: Settings;

  constructor(public service: DataStoreService) {
    this.ord = new Order(this.orderId);
    this.order = service.orderLink(this.ord);
  }

  ngOnInit() {
    }

  ngOnDestroy() {
  }

  removeOrder() {
    this.service.removeOrder(this.orderId);
  }

  updateName(name: string) {
    this.service.updateOrder(this.orderId, {name: name})
  }

  updatePaid(paid) {
    this.service.updateOrder(this.orderId, {paid: paid})
  }
}
