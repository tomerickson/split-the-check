import {Item} from './item';
import {HeaderService} from "../header.service";
import {BehaviorSubject, Observable} from "rxjs";
import {ChangeBasis} from "./change-basis";
import {observable} from "rxjs/symbol/observable";

export class Order {
  name: string;
  taxPercent: Observable<number>;
  tipPercent: Observable<number>;
  overShort: Observable<number>;
  subtotal: Observable<number>;
  delivery: Observable<number>;
  total: Observable<number>;
  paid: BehaviorSubject<number>;
  tax: Observable<number>;
  tip: Observable<number>;
  _items: Item[] = [];
  _paid: number = 0;
  _subtotal: number = 0;
  _tax: number = 0;
  _tip: number = 0;
  _delivery: number = 0;
  items: BehaviorSubject<Item[]>;

  constructor(private service: HeaderService) {
    this.items = new BehaviorSubject(this._items);
    this.taxPercent = service.taxPercent;
    this.tipPercent = service.tipPercent
    this.subtotal = Observable.of(this._items.map(itm => itm.price * itm.quantity)
      .reduce((acc, val) => acc + val, 0));
    this.paid = new BehaviorSubject(this._paid);
    this.tax = Observable.combineLatest(this.subtotal, this.taxPercent, (amt, pct) => amt * pct  / 100);
    this.tip = Observable.combineLatest(this.subtotal, this.tax, (amt, tax) => this.service.calculateTip(amt, tax));
    this.delivery = Observable.combineLatest(this.service.subtotal, this.service.delivery, this.subtotal,
      (total, delivery, subtotal) => {
        if (total == 0 || delivery == 0 || subtotal == 0) {
          return 0;
        }
        return delivery * total / subtotal;
      });
    this.total = Observable.combineLatest(this.subtotal, this.tax, this.tip, this.delivery,
      (amt, tax, tip, del) => amt + tax + tip + del);

    // The delivery charge is allocated to individual orders
    // on the basis of relative dollar value:
    //  delivery charge / total order value * individual order value
  }


  removeItem(index: number) : Observable<Item[]> {
    let myItems = this._items;
    let myItem: Item = myItems.slice(index, 1)[0];
    let delta = 0-myItem.price * myItem.quantity;
    myItems.splice(index,1);
    this._items = myItems;
    this.items.next(this._items);
    this._subtotal += delta;
    return this.items;
  }

  addItem() : Observable<Item[]> {
    let myItems = this._items;
    myItems.push(new Item());
    this._items = myItems;
    this.items.next(this._items);
    return this.items;
  }

  changeItem(delta: number) {
    this._subtotal += delta;
  }

  setPaid(paid: number){
    this.paid.next(paid);
  }
}
