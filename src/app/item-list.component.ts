/**
 * Created by Erick on 2/6/2017.
 */
import {Component, Input} from "@angular/core";
import {Order} from "./model/order";
import {Item} from "./model/item";
import {HeaderService} from "./header.service";

@Component({
  selector: "item-list-outlet",
  styles: ["table {border: 1px solid black;border-collapse: separate;}"],
  templateUrl: "./item-list.component.html"
})

export class ItemListComponent {
  @Input() order: Order;
//  @Input() items: Item[];

  constructor(private orderService: HeaderService) {
  }

  addItem() {
    this.order.addItem();
  }

  removeItem(index: number) {
    this.order.removeItem(index);
  }
}
