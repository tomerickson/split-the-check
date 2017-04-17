import {Item} from './item';
import {HeaderService} from "../header.service";
import {BehaviorSubject, Observable} from "rxjs";
import {ChangeBasis} from "./change-basis";

export class Order {
  name: string;
  taxPercent: Observable<number>;
  tipPercent: Observable<number>;
  overShort: Observable<number>;
  _items: Item[] = [];
  _paid: number;
  _subtotal: number;
  items: BehaviorSubject<Item[]>;

  constructor(private service: HeaderService) {
    this._paid = 0;
    this.items = new BehaviorSubject(this._items);
    this.taxPercent = service.taxPercent;
    this.tipPercent = service.tipPercent;

    // The delivery charge is allocated to individual orders
    // on the basis of relative dollar value:
    //  delivery charge / total order value * individual order value
  }

  get subtotal() {
    return this._subtotal;
  }

  set subtotal(delta: number){
    this._subtotal += delta;
  }

  get tax() {
    return this._subtotal * this.service.taxPercent.getValue() / 100;
  }

  get tip() {
    return this.service.calculateTip(this._subtotal, this.tax);
  }

  get delivery() {
    return this.service.calculateDelivery(this.subtotal);
  }

  get total() {
    return this.subtotal + this.tax + this.tip + this.delivery;
  }

  get paid() {
    return this._paid;
  }
  set paid(amount: number) {
    this._paid = amount;
  }

  removeItem(index: number) : Observable<Item[]> {
    let myItems = this._items;
    myItems.splice(index,1);
    this._items = myItems;
    this.items.next(this._items);
    return this.items;
  }

  addItem() : Observable<Item[]> {
    let myItems = this._items;
    myItems.push(new Item());
    this._items = myItems;
    this.items.next(this._items);
    return this.items;
  }

  changeItem(item: Item) {
    let index:number = this._items.indexOf(item);
    let items:Item[] = this._items.slice();
    items[index] = item;
    this._items = items;
  }
}
