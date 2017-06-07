import {Component, Input, OnInit} from "@angular/core";
import {Order} from "../model/order";
import {HeaderService} from "../header.service";
import {NgbAccordion} from "@ng-bootstrap/ng-bootstrap";
import {NgbPanel} from "@ng-bootstrap/ng-bootstrap";
import {DataStoreService} from "../data-store/data-store.service";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'order-list-outlet',
  styles: ['table {border: 1px solid black;border-collapse: separate}'],
  styleUrls: ["order-list.component.scss"],
  templateUrl: 'order-list.component.html'
})

export class OrderListComponent implements OnInit{
  service: DataStoreService;
  orders: Observable<Order[]>;

  constructor(svc: DataStoreService) {
    this.service = svc;
  }

  ngOnInit() {
    this.orders = this.service.getOrders();
  }

  addOrder(order: Order) {
    this.service.addOrder(order);
  }

  onRemove(event: Event, index: number) {
    this.service.removeOrder(this.orders[index]);
  }
}