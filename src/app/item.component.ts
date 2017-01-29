import {Component, Input} from "@angular/core";
import {Item} from "./model/item";
import {Order} from "./model/order";
import {OrderService} from "./order.service";

@Component({
    selector: "[item-outlet]",
    templateUrl: "./item.component.html"
})

export class ItemComponent {
    @Input() item: Item;
    @Input() index: Number;
    @Input() order: Order;

    constructor(private orderService: OrderService){

    }

    removeItem() {
      this.orderService.removeItem(this.order, this.item);
    }
}
