import {Component, Input, Output, EventEmitter, OnInit, OnDestroy} from "@angular/core";
import {Order} from "../model/order";
import {DataStoreService} from "../data-store/data-store.service";
import {Session} from "../model/session";

@Component({
  selector: 'order-outlet',
  templateUrl: './order.component.html',
  styleUrls: ['order.component.scss']
})

export class OrderComponent implements OnInit, OnDestroy {

  @Input() order: Order;
  @Input() orderId: string;
  @Input() index: number;
  @Output() onRemove = new EventEmitter<Order>();
  @Output() changeTrigger = new EventEmitter();

  session: Session;

  constructor(public service: DataStoreService) {
    this.session = new Session(service);
  }

  ngOnInit() {
    }

  ngOnDestroy() {
  }

  removeOrder() {
    this.service.removeOrder(this.orderId);
  }

  updateName(event) {
    this.service.updateOrder(this.orderId, {name: (<HTMLInputElement>event.target).value})
  }

  updatePaid(event) {
    const paid: number = +(<HTMLInputElement>event.target).value;
    this.service.updateOrder(this.orderId, {paid: paid})
  }
}
