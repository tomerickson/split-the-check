import {Item} from './item';
import {BehaviorSubject, Observable} from "rxjs";
import {DataStoreService} from "../data-store/data-store.service";

export class Order implements IDomainObject{
  key: string;
  name: string;
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
  items: Observable<Item[]>;

  constructor(private service: DataStoreService) {
    this.items = this.service.getItems(this);
    this.subtotal = Observable.of(this._items.map(itm => itm.price * itm.quantity)
      .reduce((acc, val) => acc + val, 0));
    this.paid = new BehaviorSubject<number>(0);
    this.tax = Observable.combineLatest(this.subtotal, this.service.TaxPercent, (amt, pct) => amt * pct  / 100);

    // Tips can be based on net amount or gross amount (amount plus tax)
    //
    this.tip = Observable.combineLatest(this.service.TipBasis, this.service.TipPercent, this.subtotal, this.tax,
      (tipBasis, tipPercent, subtotal, tax) => {
        let result: number = 0;
        if (tipBasis.description === 'Gross') {
          result = (subtotal + tax) * tipPercent / 100;
        } else {
          result = subtotal * tipPercent / 100;
        }
        return result;
      });

    // The delivery charge is allocated to individual orders
    // on the basis of relative dollar value:
    //  delivery charge * individual order value / total order value
    //
    this.delivery = Observable.combineLatest(this.service.Subtotal, this.service.Delivery, this.subtotal,
      (total, delivery, subtotal) => {
        if (total === 0 || delivery === 0 || subtotal === 0) {
          return 0;
        }
        return delivery * subtotal / total;
      });

    this.total = Observable.combineLatest(this.subtotal, this.tax, this.tip, this.delivery,
      (amt, tax, tip, del) => amt + tax + tip + del);

    this.overShort = Observable.combineLatest(this.total, this.paid, (total, paid) => total - paid);


  }



// return subtotal * this.tipPercent.getValue() / 100;

  addItem() {
    let item: Item = new Item(this.key);
    this.service.addItem(item);
  }

  changeItem(item: Item, index: number){
    let myItems = Array.from(this._items);
    myItems = myItems.splice(index, 1, item);
    this._items = myItems;
  }

  setPaid(paid: number){
    this.paid.next(paid);
  }
}
