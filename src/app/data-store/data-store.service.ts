///<reference path="../../../node_modules/rxjs/add/operator/map.d.ts"/>
import { Injectable, OnDestroy } from '@angular/core';
import { DataProviderService } from '../data-provider/data-provider.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/defaultIfEmpty';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/materialize'
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/toPromise';
import 'rxjs/observable/ConnectableObservable'
import { ChangeBasis, Helpers, Item, ItemBase, Order, OrderBase, Settings, TipBasis } from '../model';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/from';
import { AngularFireDatabase } from 'angularfire2/database';
import ThenableReference = firebase.database.ThenableReference;

const PATH_ORDERS = '/orders';
const PATH_ITEMS = '/items';
const PATH_SETTINGS = '/settings';
const PATH_DEFAULTS = '/defaults';
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
const PATH_ITEM = '/items/[key]/[value]';
const FILTER_DEFAULT_OPTION = {orderByChild: 'isDefault', equalTo: true, limitToFirst: 1};
const CHANGE_OPTIONS_SORT = {orderByChild: 'value'};


@Injectable()
export class DataStoreService implements OnDestroy {

  private service: DataProviderService;
  private subscriptions: Array<Subscription>;
  private helpers: Helpers;

  db: AngularFireDatabase;
  settings: Settings = null;

  buildPath = function (...x): string {
    // const args: string[] = [].concat.call(arguments);
    let result = '';
    for (let i = 0; i < arguments.length; i++) {
      if (!(result === '')) {
        result = result + '/';
      }
      result = result + arguments[i];
    }
    return result;
  };

  constructor(private svc: DataProviderService) {
    this.service = svc;
    this.db = this.service.db;
    this.subscriptions = [];
    this.helpers = new Helpers();
    this.initialize()
      .then(() => {
        console.log(`datastore initialize succeeded.`);
      }, err => console.error(`datastore initialize failed: ${err}`));
  }

  get allItems(): Observable<ItemBase[]> {
    return this.db.list<ItemBase>(PATH_ITEMS).snapshotChanges()
      .map(snapshots => snapshots.map(action => ({key: action.key, ...action.payload.val()})));
  }

  get orderCount(): Observable<number> {
    return this.db.list<OrderBase>(PATH_ORDERS).valueChanges().map(obs => obs.length);
  }

  get allOrders(): Observable<Order[]> {

    return this.db.list<Order>(PATH_ORDERS)
      .snapshotChanges()
      .map(snapshots => snapshots.map(action => {
        const order: Order = new Order(action.key, this, this.subtotal, this.helpers);
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

  get changeOptions(): Observable<ChangeBasis[]> {
    return this.service.getList<ChangeBasis>(PATH_ENUM_CHANGE_OPTIONS).valueChanges();
  }

  get tipOptions(): Observable<TipBasis[]> {
    return this.service.getList<TipBasis>(PATH_ENUM_TIP_OPTIONS).valueChanges();
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
    return this.service.getObject<boolean>(PATH_SETTINGS_SHOW_INTRO).valueChanges();
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

  get overShort(): Observable<number> {
    return Observable.combineLatest(this.total, this.paid, ((t, p) => t - p));
  }

  deliveryShare(amt: Observable<number>): Observable<number> {
    return Observable.combineLatest(amt, this.subtotal, this.delivery,
      ((a, t, delivery) => delivery * a / t));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  setShowIntro(choice: boolean) {
    return this.service.set(PATH_SETTINGS_SHOW_INTRO, choice);
  }

  setSettings(value: Settings) {
    return this.service.set(PATH_SETTINGS, value);
  }

  setTaxPercent(value: number) {
    return this.service.set(PATH_SETTINGS_TAX_PERCENT, value);
  }

  setTipPercent(value: number) {
    return this.service.set(PATH_SETTINGS_TIP_PERCENT, value);
  }

  setDelivery(value: number) {
    return this.service.set(PATH_SETTINGS_DELIVERY, value);
  }

  setChangeBasis(changeBasis) {
    return this.service.set(PATH_SETTINGS_CHANGE_OPTION, changeBasis);
  }

  setTipBasis(tipBasis: TipBasis) {
    this.service.set(PATH_SETTINGS_TIP_OPTION, tipBasis);
  }

  wrapUp() {
    this.service.remove(PATH_ORDERS);
    this.service.remove(PATH_ITEMS);
  }

  /**
   * Push a new on PATH_ORDERS
   * @returns {string}
   */
  addOrder(): ThenableReference {
    const order = new OrderBase();
    delete order.key;
    // return this.service.getList<OrderBase>(PATH_ORDERS).push(order);
    return this.service.db.list(PATH_ORDERS).push(order);
  }

  removeOrder(key: string) {
    this.service.remove(this.buildPath(PATH_ORDERS, key));
  }

  getOrder(key: string): Observable<OrderBase> {
    /*
    const result: AngularFireObject<OrderBase> = this.service.getObject<OrderBase>(this.buildPath(PATH_ORDERS, key));
    const result2 = this.ExtractIDomainObjectFromSnapshot(result);
    return result2;*/
    let result: Observable<OrderBase>;
    return this.service.getObject<OrderBase>(this.buildPath(PATH_ORDERS, key))
      .snapshotChanges()
      .map(action => result = {key: action.key, ...action.payload.val()});
  }

  getPaid(key: string): Observable<number> {
    return this.service.getObject<number>(this.buildPath(PATH_ORDERS, key, 'paid')).valueChanges();
  }

  //
  getItems(orderId: string): Observable<ItemBase[]> {

    let result: Observable<ItemBase[]>;
    return this.service.query<ItemBase>(PATH_ITEMS, ref => ref.orderByChild('orderId').equalTo(orderId)).snapshotChanges()
      .map(snapshots => snapshots.map(action => result = {key: action.key, ...action.payload.val()}));
  }

  // Order level queries

  updateOrder(key: string, updates) {
    return this.service.updateObject<Order>(this.buildPath(PATH_ORDERS, key), updates);
  }

  addItem(item: ItemBase): ThenableReference {
    delete item.key;
    return this.service.query<ItemBase>(PATH_ITEMS, ref => ref.orderByChild('orderId')
      .equalTo(item.orderId)).push(item);
  }

  removeItem(itemId: string) {
    return this.service.remove(this.buildPath(PATH_ITEMS, itemId));
  }

  updateItem(item: ItemBase) {
    return this.service.updateObject<Item>(this.buildPath(PATH_ITEMS, item.key), item);
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

    return new Promise<void>(() => {
      this.initializeSetting<number>(PATH_DEFAULT_TAX_PERCENT, PATH_SETTINGS_TAX_PERCENT);
      this.initializeSetting<number>(PATH_DEFAULT_TIP_PERCENT, PATH_SETTINGS_TIP_PERCENT);
      this.initializeSetting<number>(PATH_DEFAULT_DELIVERY, PATH_SETTINGS_DELIVERY);
      this.initializeSetting<boolean>(PATH_DEFAULT_SHOW_INTRO, PATH_SETTINGS_SHOW_INTRO);
      this.initializeSetting<TipBasis>(PATH_DEFAULT_TIP_OPTION, PATH_SETTINGS_TIP_OPTION);
      this.initializeSetting<ChangeBasis>(PATH_DEFAULT_CHANGE_OPTION, PATH_SETTINGS_CHANGE_OPTION);
      this.subscriptions.push(this.db.object<Settings>(PATH_SETTINGS).valueChanges().subscribe(obs => this.settings = obs));
    });
  }
}
