import {Component, Input, Output, EventEmitter} from "@angular/core";
import {Item} from "./model/item";
import {Order} from "./model/order";
import {OrderService} from "./order.service";

@Component({
  selector: "[item-outlet]",
  templateUrl: "./item.component.html"
})

export class ItemComponent {
  @Input() item: Item;
  @Input() index: number;
  @Input() order: Order;
  @Output() valueChange = new EventEmitter<number>();
  @Output() removeItem = new EventEmitter<number>();

  private priorValue: number;

  constructor(private orderService: OrderService) {
    this.priorValue = 0;
  }

  onRemove() {
    this.removeItem.emit(this.index);
  }

  onChange() {
    let valueChange = this.orderService.changeItem(this.item, this.priorValue);
    if (valueChange != 0) {
      this.valueChange.emit(valueChange);
    }
  }
}
