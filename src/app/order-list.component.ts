import {Component, Input} from "@angular/core";
import {Order} from "./model/order";
import {HeaderService} from "./header.service";
import {NgbAccordion} from "@ng-bootstrap/ng-bootstrap";
import {NgbPanel} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'order-list-outlet',
  styles: ['table {border: 1px solid black;border-collapse: separate}'],
  styleUrls: ["order-list.component.scss"],
  templateUrl: './order-list.component.html'
})

export class OrderListComponent {
  service: HeaderService;

  constructor(svc: HeaderService) {
    this.service = svc;
  }

  addOrder() {
    this.service.addOrder();
  }

  onRemove(event: Event, index: number) {
    this.service.removeOrder(index);
  }
}
