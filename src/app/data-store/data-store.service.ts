import { Injectable, OnDestroy } from '@angular/core';
import { DataProviderService } from '../data-provider/data-provider.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/defaultIfEmpty';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/materialize'
import 'rxjs/add/operator/publish';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/toPromise';
import 'rxjs/observable/ConnectableObservable'
import { ChangeBasis, IItem, IOrder, Item, Order, Settings, TipBasis } from '../model';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/from';

const PATH_ORDERS = '/orders';
const PATH_ITEMS = '/items';
const PATH_SETTINGS = '/settings';
const PATH_SESSION = '/orderSummary';
const PATH_DEFAULTS = '/defaults';
const PATH_DEFAULT_TAX_PERCENT = '/defaults/taxPercent';
const PATH_DEFAULT_TIP_PERCENT = '/defaults/tipPercent';
const PATH_DEFAULT_DELIVERY = '/defaults/delivery';
const PATH_DEFAULT_SHOW_INTRO = '/defaults/showIntro';
const PATH_DEFAULT_CHANGE_OPTION = '/enumerations/changeOptions/4';
const PATH_DEFAULT_TIP_OPTION = '/enumerations/tipOptions/0';
const PATH_SETTINGS_TAX_PERCENT = '/settings/taxPercent';
const PATH_SETTINGS_TIP_PERCENT = '/settings/tipPercent';
const PATH_SETTINGS_DELIVERY = '/settings/delivery';
const PATH_SETTINGS_SHOW_INTRO = '/settings/showIntro';
const PATH_SETTINGS_TIP_OPTION = '/settings/tipOption';
const PATH_SETTINGS_CHANGE_OPTION = '/settings/changeOption';
const PATH_ENUM_CHANGE_OPTIONS = '/enumerations/changeOptions';
const PATH_ENUM_TIP_OPTIONS = '/enumerations/tipOptions';
const PATH_ITEM = '/items/[key]/[value]';
const FILTER_DEFAULT_OPTION = {orderByChild: 'isDefault', equalTo: true, limitToFirst: 1};
const CHANGE_OPTIONS_SORT = {orderByChild: 'value'};


@Injectable()
export class DataStoreService implements OnDestroy {

  public settings: BehaviorSubject<Settings>;
  private service: DataProviderService;
  private subscriptions: Array<Subscription>;

  constructor(private svc: DataProviderService) {
    this.service = svc;
    this.subscriptions = [];
    this.initialize();
  }

  get allItems(): Observable<IItem[]> {
    return this.service.getList<IItem>(PATH_ITEMS).valueChanges();
  }

  get allOrders(): Observable<IOrder[]> {
    return this.service.getList<IOrder>(PATH_ORDERS).valueChanges();
  }

  get changeOption(): BehaviorSubject<ChangeBasis> {
    return <BehaviorSubject<ChangeBasis>>this.service.getItem<ChangeBasis>(PATH_DEFAULT_CHANGE_OPTION)
      .valueChanges();
  }

  get tipOption(): BehaviorSubject<TipBasis> {
    return <BehaviorSubject<TipBasis>> this.service.getItem<TipBasis>(PATH_DEFAULT_TIP_OPTION)
      .valueChanges();
  }

  get changeOptions(): Observable<ChangeBasis> {
    return this.service.getItem<ChangeBasis>(PATH_ENUM_CHANGE_OPTIONS).valueChanges();
  }

  get tipOptions(): Observable<TipBasis[]> {
    return this.service.getList<TipBasis>(PATH_ENUM_TIP_OPTIONS).valueChanges();
  }

  get taxPercent(): Observable<number> {
    return this.service.getItem<number>(PATH_SETTINGS_TAX_PERCENT).valueChanges();
  }

  get tipPercent(): Observable<number> {
    return this.service.getItem<number>(PATH_SETTINGS_TIP_PERCENT).valueChanges();
  }

  get delivery(): Observable<number> {
    return this.service.getItem<number>(PATH_SETTINGS_DELIVERY).valueChanges();
  }

  get showIntro(): Observable<boolean> {
    return this.service.getItem<boolean>(PATH_SETTINGS_SHOW_INTRO).valueChanges();
  }

  get subtotal(): Observable<number> {
    return this.allItems.map(each => each.map(item => item.price * item.quantity)
      .reduce((sum, vlu) => sum + vlu, 0));
  }

  tax(subtotal: Observable<number>): Observable<number> {
    return Observable.combineLatest(subtotal, this.taxPercent, ((amt, pct) => amt * pct / 100));
  }

  tip(subtotal: Observable<number>, taxAmount: Observable<number>): Observable<number> {
    return Observable.combineLatest(subtotal, taxAmount, this.tipOption, this.tipPercent,
      ((amt, tax, basis, pct) => amt + ((basis.description === 'Gross') ? tax : 0) * pct / 100))
  }

  deliveryShare(amt: Observable<number> ): Observable<number> {
    return Observable.combineLatest(amt, this.subtotal, this.delivery,
      ((a, t, delivery) => delivery * a / t));
  }

  total(subtotal: Observable<number>, taxAmount: Observable<number>, tipAmount: Observable<number>, delivery: Observable<number>) {
    return Observable.combineLatest(subtotal, taxAmount, tipAmount, delivery,
      ((amt, tax, tip, del) => amt + tax + tip + del))
  }

  overShort(total: Observable<number>, paid: Observable<number>): Observable<number> {
    return Observable.combineLatest(total, paid, ((t, p) => t - p));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  setShowIntro(choice: boolean) {
    this.service.set(PATH_SETTINGS, {showIntro: choice});
  }

  setTaxPercent(value: number) {
    return this.service.set(PATH_SETTINGS_TAX_PERCENT, value);
  }

  setTipPercent(value: number) {
    return this.service.set(PATH_SETTINGS, {tipPercent: value});
  }

  setDelivery(value: number) {
    return this.service.set(PATH_SETTINGS, {delivery: value});
  }

  setChangeBasis(changeBasis) {
    return this.service.set(PATH_SETTINGS_CHANGE_OPTION, changeBasis);
  }

  setTipBasis(tipBasis: TipBasis) {
    this.service.set(PATH_SETTINGS_TIP_OPTION, tipBasis);
  }

  setSettings(settings: Settings): Promise<void> {
    return this.service.set(PATH_SETTINGS, settings);
  }

  wrapUp() {
    this.service.remove(PATH_ORDERS);
    this.service.remove(PATH_ITEMS);
  }

  //
  addOrder() {
    this.service.push<IOrder>(PATH_ORDERS, {key: null, name: null, paid: 0, items: null});
  }

  removeOrder(key: string) {
    this.service.remove(PATH_ORDERS + key);
  }

  getOrder(key: string): Observable<IOrder> {
    return this.service.getItem<IOrder>(PATH_ORDERS + key)
      .valueChanges();
  }

  getPaid(key: string): Observable<number> {
    return this.service.getItem<number>(PATH_ORDERS + key + '/paid').valueChanges();
  }

  //
  getItems(orderId: string): Observable<IItem[]> {

    const filter = {orderByChild: 'orderId', equalTo: orderId};
    return this.service.query<IItem>(PATH_ITEMS, filter).valueChanges();
  }

  // Order level queries

  updateOrder(key: string, updates) {
    this.service.updateObject<Order>(PATH_ORDERS + key, updates);
  }

  //
  addItem(orderId: string) {
    this.service.push<IItem>(PATH_ITEMS, {
      orderId: orderId,
      description: null, quantity: null, price: null, instructions: null, key: null
    });
  }

  removeItem(itemId: string) {
    this.service.remove(PATH_ITEMS + itemId);
  }

  updateItem(item: Item) {
    return this.service.updateObject<Item>(PATH_ITEMS + item.key, item);
  }

  // Return items attached to an order,
  // update item.key with the firebase key

  /**
   * Initialize state
   *
   * @returns {Promise<any>}
   */
  initialize(): Promise<any> {
    const promise = new Promise<any>(() => {

      this.subscriptions.push(this.service.getItem<number>(PATH_DEFAULT_TAX_PERCENT).valueChanges()
        .subscribe(tax => this.service.set(PATH_SETTINGS_TAX_PERCENT, tax)));
      this.subscriptions.push(this.service.getItem<number>(PATH_DEFAULT_TIP_PERCENT).valueChanges()
        .subscribe(tip => this.service.set(PATH_SETTINGS_TIP_PERCENT, tip)));
      this.subscriptions.push(this.service.getItem<number>(PATH_DEFAULT_DELIVERY).valueChanges()
        .subscribe(delivery => this.service.set(PATH_SETTINGS_DELIVERY, delivery)));
      this.subscriptions.push(this.service.getItem<boolean>(PATH_DEFAULT_SHOW_INTRO).valueChanges()
        .subscribe(show => this.service.set(PATH_SETTINGS_SHOW_INTRO, show)));
      this.subscriptions.push(this.service.getItem<TipBasis>(PATH_DEFAULT_TIP_OPTION).valueChanges()
        .subscribe(option => this.service.set(PATH_SETTINGS_TIP_OPTION, option)));
      this.subscriptions.push(this.service.getItem<ChangeBasis>(PATH_DEFAULT_CHANGE_OPTION).valueChanges()
        .subscribe(option => this.service.set(PATH_SETTINGS_CHANGE_OPTION, option)));
    })
      .catch((err) => console.error('iniitialze error: ' + err));
    return promise;
  }
}
