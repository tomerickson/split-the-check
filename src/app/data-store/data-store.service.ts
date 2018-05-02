///<reference path="../../../node_modules/rxjs/add/operator/map.d.ts"/>
import { Injectable, OnDestroy } from '@angular/core';
import { DataProviderService } from '../data-provider/data-provider.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ChangeBasis, Helpers, Item, ItemType, Order, OrderType, Settings, TipBasis } from '../model';
import { Subscription } from 'rxjs/Subscription';
import { AngularFireDatabase } from 'angularfire2/database';
import { ThenableReference } from '@firebase/database-types';

const PATH_ORDERS = '/orders';
const PATH_ITEMS = '/items';
const PATH_SETTINGS = '/settings';
// const PATH_DEFAULTS = '/defaults';
const PATH_DEFAULT_TAX_PERCENT = 'defaults/taxPercent';
const PATH_DEFAULT_TIP_PERCENT = '/defaults/tipPercent';
const PATH_DEFAULT_DELIVERY = '/defaults/delivery';
const PATH_DEFAULT_SHOW_INTRO = '/defaults/showIntro';
const PATH_DEFAULT_CHANGE_OPTION = '/enumerations/changeOptions/4';
const PATH_DEFAULT_TIP_OPTION = '/enumerations/tipOptions/0';
const PATH_SETTINGS_TAX_PERCENT = 'settings/taxPercent';
const PATH_SETTINGS_TIP_PERCENT = '/settings/tipPercent';
const PATH_SETTINGS_DELIVERY = '/settings/delivery';
const PATH_SETTINGS_SHOW_INTRO = '/settings/showIntro';
const PATH_SETTINGS_TIP_OPTION = '/settings/tipOption';
const PATH_SETTINGS_CHANGE_OPTION = '/settings/changeOption';
const PATH_ENUM_CHANGE_OPTIONS = '/enumerations/changeOptions';
const PATH_ENUM_TIP_OPTIONS = '/enumerations/tipOptions';
/*
const PATH_ITEM = '/items/[key]/[value]';
const FILTER_DEFAULT_OPTION = {orderByChild: 'isDefault', equalTo: true, limitToFirst: 1};
const CHANGE_OPTIONS_SORT = {orderByChild: 'value'};
*/


@Injectable()
export class DataStoreService implements OnDestroy {

  private unwrappedSettings: Settings;
  private service: DataProviderService;
  private subscriptions: Array<Subscription>;
  private readonly helpers: Helpers;

  db: AngularFireDatabase;

  constructor(private svc: DataProviderService) {
    this.service = svc;
    this.db = this.service.db;
    this.subscriptions = [];
    this.helpers = new Helpers();
    this.subscriptions.push(this.settings.subscribe(obs => this.unwrappedSettings = obs));
    this.initialize()
      .then(() => {
        console.log(`datastore initialize succeeded.`);
      }, err => console.error(`datastore initialize failed: ${err}`));
  }

  get tipOptions(): Observable<TipBasis[]> {
    return this.service.query<TipBasis>(PATH_ENUM_TIP_OPTIONS,
        ref => ref.orderByChild('value')).valueChanges();
  }

  get changeOptions(): Observable<ChangeBasis[]> {
    return this.service.query<ChangeBasis>(PATH_ENUM_CHANGE_OPTIONS,
            ref => ref.orderByChild('value')).valueChanges();
  }

  get settings(): Observable<Settings> {
    return this.db.object<Settings>(PATH_SETTINGS).valueChanges();
  }

  get allItems(): Observable<ItemType[]> {
    return this.db.list<ItemType>(PATH_ITEMS).snapshotChanges()
      .map(snapshots => snapshots.map(action => ({key: action.key, ...action.payload.val()})));
  }

  get allOrders(): Observable<Order[]> {

    return this.service.getList<Order>(PATH_ORDERS)
      .snapshotChanges()
      .map(snapshots => snapshots.map(action => {
        const order: Order = new Order(action.key, this.unwrappedSettings, this, this.subtotal, this.helpers);
        order.key = action.key;
        order.name = action.payload.val().name;
        order.paid = action.payload.val().paid;
        return order;
      }));
  }

  get changeOption(): BehaviorSubject<ChangeBasis> {
    return <BehaviorSubject<ChangeBasis>>this.service.getObject<ChangeBasis>(PATH_DEFAULT_CHANGE_OPTION)
      .valueChanges();
  }

  get tipOption(): BehaviorSubject<TipBasis> {
    return <BehaviorSubject<TipBasis>>this.service.getObject<TipBasis>(PATH_DEFAULT_TIP_OPTION)
      .valueChanges();
  }

  get taxPercent(): Observable<number> {
    return this.service.getObject<number>(PATH_SETTINGS_TAX_PERCENT).valueChanges();
  }

  get tipPercent(): Observable<number> {
    return this.service.getObject<number>(PATH_SETTINGS_TIP_PERCENT).valueChanges();
  }

  get delivery(): Observable<number> {
    return this.service.getObject<number>(PATH_SETTINGS_DELIVERY).valueChanges();
  }

  get showIntro(): Observable<boolean> {
    return this.service.getObject<boolean>(PATH_SETTINGS_SHOW_INTRO)
      .valueChanges();
  }


  get subtotal(): Observable<number> {
    return this.allItems.map(each => each.map(item => item.price * item.quantity)
      .reduce((sum, vlu) => sum + vlu, 0));
  }

  get tax(): Observable<number> {
    return Observable.combineLatest(this.subtotal, this.taxPercent, ((amt, pct) => amt * pct / 100));
  }

  get tip(): Observable<number> {
    return Observable.combineLatest(this.subtotal, this.tax, this.tipOption, this.tipPercent,
      ((amt, tax, basis, pct) => (amt + ((basis.description === 'Gross') ? tax : 0)) * pct / 100))
  }

  get total(): Observable<number> {
    return Observable.combineLatest(this.subtotal, this.tax, this.tip, this.delivery,
      ((amt, tax, tip, del) => amt + tax + tip + del));
  }

  get paid(): Observable<number> {
    return this.allOrders.map(orders => orders.map(order => order.paid || 0)
      .reduce((sum, vlu) => sum + vlu, 0));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  setSettings(value: Settings) {
    return this.service.set(PATH_SETTINGS, value);
  }

  setShowIntro(choice: boolean) {
    return this.service.set(PATH_SETTINGS_SHOW_INTRO, choice);
  }

  wrapUp() {
    return this.service.remove(PATH_ORDERS).then(() => this.service.remove(PATH_ITEMS));
  }

  /**
   * Push a new on PATH_ORDERS
   * @returns {string}
   */
  addOrder(): ThenableReference {
    const order = new OrderType();
    delete order.key;
    return this.service.getList<OrderType>(PATH_ORDERS).push(order);
  }

  removeOrder(key: string) {
    let promise: Promise<void> = null;
    this.service.remove(this.buildPath(PATH_ORDERS, key))
      .then(
        () => promise = this.removeItems(key)
        , (err) => console.log(`removeOrder failed on key ${key} with error ${err}.`));
    return promise;
  }

  getItems(orderId: string): Observable<ItemType[]> {

    let result: Observable<ItemType[]>;
    return this.service.query<ItemType>(PATH_ITEMS, ref => ref.orderByChild('orderId').equalTo(orderId)).snapshotChanges()
      .map(snapshots => snapshots.map(action => result = {key: action.key, ...action.payload.val()}));
  }

  // Order level queries

  updateOrder(key: string, updates) {
    return this.service.updateObject<Order>(this.buildPath(PATH_ORDERS, key), updates);
  }

  addItem(item: ItemType): ThenableReference {
    delete item.key;
    return this.service.push(PATH_ITEMS, item);
  }

  removeItems(orderId: string): Promise<void> {

    return this.service.query<ItemType>(PATH_ITEMS, ref => ref
      .orderByChild('orderId')
      .equalTo(orderId)).snapshotChanges()
      .forEach(items => items.forEach(item => {
          return this.service.remove(this.buildPath(PATH_ITEMS, item.key));
        }
      ));
  }

  removeItem(itemId: string): Promise<any> {
    return this.service.removeChild(PATH_ITEMS, itemId);

  }

  updateItem(item: ItemType) {
    const itemKey = item.key;
    delete item.key;
    return this.service.updateObject<Item>(this.buildPath(PATH_ITEMS, itemKey), item);
  }

  /**
   * Copy a setting from the /defaults node to the /settings node
   *
   * @param {string} fromPath
   * @param {string} toPath
   * @returns {Promise<any>}
   */
  initializeSetting<T>(fromPath: string, toPath: string): Promise<any> {

    return new Promise<T>(() => this.db.object<T>(fromPath)
      .valueChanges().map(obs => this.db.object<T>(toPath).set(obs)).toPromise());
  }

  /**
   * Initialize state
   *
   * @returns {Promise<any>}
   */
  initialize(): Promise<any> {

    return this.initializeSetting<number>(PATH_DEFAULT_TAX_PERCENT, PATH_SETTINGS_TAX_PERCENT)
      .then(() => this.initializeSetting<number>(PATH_DEFAULT_TIP_PERCENT, PATH_SETTINGS_TIP_PERCENT)
        .then(() => this.initializeSetting<number>(PATH_DEFAULT_DELIVERY, PATH_SETTINGS_DELIVERY)
          .then(() => this.initializeSetting<boolean>(PATH_DEFAULT_SHOW_INTRO, PATH_SETTINGS_SHOW_INTRO)
            .then(() => this.initializeSetting<TipBasis>(PATH_DEFAULT_TIP_OPTION, PATH_SETTINGS_TIP_OPTION)
              .then(() => this.initializeSetting<ChangeBasis>(PATH_DEFAULT_CHANGE_OPTION, PATH_SETTINGS_CHANGE_OPTION))))));
    /*
    return new Promise<void>(() => {
      this.initializeSetting<number>(PATH_DEFAULT_TAX_PERCENT, PATH_SETTINGS_TAX_PERCENT);
      this.initializeSetting<number>(PATH_DEFAULT_TIP_PERCENT, PATH_SETTINGS_TIP_PERCENT);
      this.initializeSetting<number>(PATH_DEFAULT_DELIVERY, PATH_SETTINGS_DELIVERY);
      this.initializeSetting<boolean>(PATH_DEFAULT_SHOW_INTRO, PATH_SETTINGS_SHOW_INTRO);
      this.initializeSetting<TipBasis>(PATH_DEFAULT_TIP_OPTION, PATH_SETTINGS_TIP_OPTION);
      this.initializeSetting<ChangeBasis>(PATH_DEFAULT_CHANGE_OPTION, PATH_SETTINGS_CHANGE_OPTION);
    });*/
  };

  /**
   *  buildPath concatenates array elements,
   *  separating them with a slash, to create a
   *  path argument for database operations
   */
  buildPath = function (...x): string {
    const delimiter = '/';
    const rex = RegExp('[\\' + delimiter + ']{2,}', 'g');
    return x.join(delimiter).replace(rex, delimiter);
  };
}
