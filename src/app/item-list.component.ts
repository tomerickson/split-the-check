/**
 * Created by Erick on 2/6/2017.
 */
import {Component, Input} from "@angular/core";
import {Order} from "./model/order";
import {HeaderService} from "./header.service";

@Component({
  selector: "item-list-outlet",
  templateUrl: "./item-list.component.html"
})

export class ItemListComponent {

  @Input() order: Order;

  constructor(private service: HeaderService) {
  }

  addItem() {
    this.service.addItem(this.order);
  }

  removeItem(index: number) {
    this.service.removeItem(this.order, index);
  }
}
