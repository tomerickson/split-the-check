/**
 * Created by Erick on 2/6/2017.
 */
import {Component, Input} from "@angular/core";
import {Order} from "./model/order";
import {Item} from "./model/item";
import {OrderService} from "./order.service";

@Component({
  selector: "item-list-outlet",
  styles: ["table {border: 1px solid black;border-collapse: separate;}"],
  templateUrl: "./item-list.component.html"
})

export class ItemListComponent {
  @Input() order: Order;
  @Input() items: Item[];
  constructor(private orderService: OrderService) {
  }

  addItem() {
    this.orderService.addItem(this.order);
    this.items = this.orderService.getItems(this.order);
  }

  removeItem(index: number) {
  this.orderService.removeItem(this.order, index);
}

  changeItem() {
    this.orderService.calculateOrder(this.order)
  }

  updatePaid() {
    this.orderService.calculateOrder(this.order);
  }
}
