import {Component, Input, Output, EventEmitter} from "@angular/core";
import {Order} from "../model/order";
import {HeaderService} from "../header.service";
import {Header} from "../model/header";
import {BehaviorSubject} from "rxjs";
import {DataStoreService} from "../data-store/data-store.service";

@Component({
  selector: 'order-outlet',
  templateUrl: './order.component.html',
  styleUrls: ['order.component.scss']
})

export class OrderComponent {

  @Input() order: Order;
  @Input() index: number;
  @Output() onRemove = new EventEmitter<Order>();
  @Output() changeTrigger = new EventEmitter();
  paid: number;

  constructor(private service: DataStoreService) {
    this.paid = 0;
  }

  removeOrder() {
    this.onRemove.emit(this.order);
  }

  updatePaid() {
    //this.paid = paid;
    this.service.setPaid(this.order, this.paid);
  }

  // When an item is changed or removed
  // recalculate the tax, tip and deliver
  // allocated to the order
  changeItem(changeValue: number) {

  }
}
