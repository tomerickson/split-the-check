import {Injectable, EventEmitter} from "@angular/core";
import "rxjs/Rx";
import {Http} from "@angular/http";
import {Order} from "./model/order";
import {Item} from "./model/item";
import {Header} from "./model/header";

@Injectable()

export class OrderService {

  ordersChange = new EventEmitter<Order[]>();

  private header: Header;

  private orders: Order[] = [];

  constructor(private http: Http) {
    this.header = new Header();
  }

  public addOrder(): void {
    this.header.orders.push(new Order());
  }

  public removeOrder(index: number) {
    let orders: Order[] = this.header.orders;
    orders.splice(index, 1);
    this.header.orders = orders;
  }

  public addItem(order: Order) {
    order.items.push(new Item());
  }

  public removeItem(order: Order, item: Item) {

    order.items.splice(order.items.indexOf(item), 1);
  }

  public editItem(item: Item) {

  }

  public getHeader() {
    return this.header;
  }

  public getOrders(): Order[] {
    return this.header.orders;
  }

  public getItems(order: Order) {
    return order.items;
  }
}
