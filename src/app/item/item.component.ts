import {Component, Input, Output, EventEmitter, SimpleChanges} from "@angular/core";
import {Item} from "../model/item";
import {Order} from "../model/order";
import {DataStoreService} from "../data-store/data-store.service";

export class itemPayload {
  index: number;
  item: Item;

  constructor(index: number, item: Item) {
    this.index = index;
    this.item = item;
  }
}

@Component({
  selector: "[item-outlet]",
  templateUrl: "./item.component.html",
  styleUrls: ["./item.component.scss"]
})

export class ItemComponent {
  @Input() item: Item;
  @Input() index: number;
  @Input() order: Order;
  @Output() changeItem = new EventEmitter<itemPayload>();
  @Output() removeItem = new EventEmitter<number>()


  private priorValue: number;

  constructor(private service: DataStoreService) {
    this.priorValue = 0;
  }

  onRemove() {
    this.removeItem.emit(this.index);
  }

  onFocusOut(event: Event) {
    debugger;
  }

  onChange() {
    let delta = this.item.quantity * this.item.price - this.priorValue;
    if (delta !== 0) {
      this.priorValue = this.item.quantity * this.item.price;
      this.changeItem.emit(new itemPayload(this.index, this.item));
    }
  }
}
