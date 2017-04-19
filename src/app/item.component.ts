import {Component, Input, Output, EventEmitter} from "@angular/core";
import {Item} from "./model/item";
import {Order} from "./model/order";
import {HeaderService} from "./header.service";

@Component({
  selector: "[item-outlet]",
  templateUrl: "./item.component.html",
  styleUrls: ["./item.component.scss"]
})

export class ItemComponent {
  @Input() item: Item;
  @Input() index: number;
  @Input() order: Order;
  @Output() changeItem = new EventEmitter<number>();
  @Output() removeItem = new EventEmitter<number>();

  private priorValue: number;

  constructor(private orderService: HeaderService) {
    this.priorValue = 0;
  }

  onRemove() {
    this.removeItem.emit(this.index);
  }

  onChange() {
    let delta = this.item.quantity * this.item.price - this.priorValue;
    if (delta != 0) {
      this.priorValue = this.item.quantity * this.item.price;
      this.changeItem.emit(delta);
    }
  }
}
