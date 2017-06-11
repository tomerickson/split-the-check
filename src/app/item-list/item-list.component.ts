/**
 * Created by Erick on 2/6/2017.
 */
import {Component, Input} from "@angular/core";
import {Order} from "../model/order";
import {Item} from "../model/item";
import {itemPayload} from "../item/item.component";
import {DataStoreService} from "../data-store/data-store.service";

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
    this.service.addItem(new Item(this.order.key));
  }

  removeItem(item: Item) {
    this.service.removeItem(item);
  }

  changeItem(item: Item, arg: object) {
    this.service.updateItem(item, arg);
  }
}
