/**
 * Created by Erick on 2/6/2017.
 */
import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {Order} from "../model/order";
import {Item} from "../model/item";
import {DataStoreService} from "../data-store/data-store.service";
import {Observable} from "rxjs/Observable";

@Component({
  selector: "item-list-outlet",
  templateUrl: "item-list.component.html",
  styleUrls: ["item-list.component.scss"]
})

export class ItemListComponent implements OnInit, OnDestroy {
  @Input() orderId: string;
  items: Observable<Item[]>;

  constructor(public service: DataStoreService) {
  }

  ngOnInit() {
    this.items = this.service.getItems(this.orderId);
  }
  ngOnDestroy() {

  }

  addItem() {
    this.service.addItem(this.orderId);
  }

  removeItem(item: Item) {
    this.service.removeItem(item);
  }

  changeItem(item: Item, arg: object) {
    this.service.updateItem(item, arg);
  }
}
