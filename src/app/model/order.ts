import {Item} from './item';
import {HeaderService} from "../header.service";
import {BehaviorSubject, Observable} from "rxjs";
import {ChangeBasis} from "./change-basis";

export class Order {
  name: string;
  tipBasis: BehaviorSubject<number>;
  chgBasis: BehaviorSubject<number>;
  taxPercent: Observable<number>;
  tipPercent: Observable<number>;
  subtotal: Observable<number>;
  tax: Observable<number>;
  tip: Observable<number>;
  delivery: Observable<number>;
  total: Observable<number>;
  overShort: Observable<number>;
  _items: Item[] = [];
  _paid: number;
  items: Observable<Item[]>;
  paid: Observable<number>;

  constructor(private service: HeaderService) {
    this._paid = 0;
    this.items = Observable.of(this._items);
    this.paid = Observable.of(this._paid);
    this.subtotal = Observable.from(this._items)
      .map(item => item.quantity * item.price)
      .reduce((result, acc) => result + acc, 0);
    this.tax = Observable.combineLatest(this.subtotal, this.service.getSalesTaxPercent(), (amt, pct) => {
      return amt * pct / 100;});
    this.tip = Observable.combineLatest(this.subtotal, this.service.getTipPercent(), (amt, pct) => {
      return amt * pct / 100;});
    this.delivery = Observable.combineLatest(this.service.getSubTotal()
      , this.service.getDelivery()
      , this.subtotal
      , (totalAmount, delivery, thisAmount) => {
      let amt: number = 0;
      if (totalAmount > 0){
        if (thisAmount > 0) {
          if (delivery > 0) {
            amt = (thisAmount / totalAmount) * delivery;
          }
        }
      }
      return amt;
    });
    this.total = Observable.combineLatest(this.subtotal, this.tax, this.tip, this.delivery, (subtotal, tax, tip, delivery) => {
      return subtotal + tax + tip + delivery;
    });
    this.overShort = Observable.combineLatest(this.total, this.paid, this.service.chgBasis,
      (total, paid, basis:ChangeBasis) => {
      let amt:number = 0;
      if (total > 0) {
        let chg: number = basis.value;
        amt = Math.round((total - paid) / amt) * amt;
      }
      return amt;
    });
  }

  setPaid(amount: number) {
    this._paid = amount;
  }

  removeItem(index: number){
    this._items = this._items.splice(index,1);
  }

  addItem(){
    this._items = this._items.concat(new Item());
  }

  changeItem(item: Item) {
    let index:number = this._items.indexOf(item);
    let items:Item[] = this._items.slice();
    items[index] = item;
    this._items = items;
  }
}
