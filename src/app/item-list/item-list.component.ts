/**
 * Created by Erick on 2/6/2017.
 */
import {Component, Input} from "@angular/core";
import {Order} from "../model/order";
import {Item} from "../model/item";
import {DataStoreService} from "../data-store/data-store.service";
import {Observable} from "rxjs/Observable";

@Component({
  selector: "item-list-outlet",
  templateUrl: "item-list.component.html",
  styleUrls: ["item-list.component.scss"]
})

export class ItemListComponent {

  @Input() order: Order;

  constructor(private service: DataStoreService) {
  }

  addItem() {
    this.service.addItem(this.order.key);
  }

  removeItem(item: Item) {
    this.service.removeItem(item);
  }

  changeItem(item: Item, arg: object) {
    this.service.updateItem(item, arg);
  }

  get items(): Observable<Item[]> {
    return this.service.getItems(this.order.key);
}
}
