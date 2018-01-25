///<reference path="../../../node_modules/rxjs/add/operator/map.d.ts"/>
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
import { ChangeBasis, ItemBase, OrderBase, Item, Order, Settings, TipBasis } from '../model';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/from';
import * as firebase from 'firebase';
import { AngularFireList, AngularFireObject } from 'angularfire2/database';
import { SnapshotAction } from 'angularfire2/database/interfaces';
import ThenableReference = firebase.database.ThenableReference;

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
const FILTER_DEFAULT_OPTION = { orderByChild: 'isDefault', equalTo: true, limitToFirst: 1 };
const CHANGE_OPTIONS_SORT = { orderByChild: 'value' };


@Injectable()
export class DataStoreService implements OnDestroy {

  private service: DataProviderService;
  private subscriptions: Array<Subscription>;

  constructor(private svc: DataProviderService) {
    this.service = svc;
    this.subscriptions = [];
    this.initialize();
  }

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
  }

  set settings(settings: Observable<Settings>) {
    this.service.db.database.ref(PATH_SETTINGS).set(settings);
  }

  get settings(): Observable<Settings> {
    return this.service.getObject<Settings>(PATH_SETTINGS).valueChanges();
    // .snapshotChanges()
      // .map(snapshot => snapshot.payload.val());
  }

  get allItems(): Observable<ItemBase[]> {

    let result: Observable<ItemBase[]>;
    return this.service.getList<ItemBase>(PATH_ITEMS).snapshotChanges()
      .map(snapshots => snapshots.map(action => result = {key: action.key, ...action.payload.val()}));
  }

  get allOrders(): Observable<OrderBase[]> {
    /*return this.ExtractIDomainListFromSnapshot(this.service.getList<OrderBase>(PATH_ORDERS));*/

    const result: Observable<OrderBase[]>
    = this.service.getList<OrderBase>(PATH_ORDERS).snapshotChanges()
    .map(snapshots => snapshots.map(action => ({key: action.key, ...action.payload.val()})));
    return result;
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

  tax(subtotal: Observable<number>): Observable<number> {
    return Observable.combineLatest(subtotal, this.taxPercent, ((amt, pct) => amt * pct / 100));
  }

  tip(subtotal: Observable<number>, taxAmount: Observable<number>): Observable<number> {
    return Observable.combineLatest(subtotal, taxAmount, this.tipOption, this.tipPercent,
      ((amt, tax, basis, pct) => (amt + ((basis.description === 'Gross') ? tax : 0)) * pct / 100))
  }

  deliveryShare(amt: Observable<number>): Observable<number> {
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
    return this.service.set(PATH_SETTINGS_SHOW_INTRO, choice);
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

  setSettings(settings: Settings): Promise<void> {
    return this.service.set(PATH_SETTINGS, settings);
  }

  wrapUp() {
    this.service.remove(PATH_ORDERS);
    this.service.remove(PATH_ITEMS);
  }

  /**
   * Push a new on PATH_ORDERS
   * @returns {string}
   */
  addOrder(order: OrderBase): ThenableReference {
    delete order.key;
    return this.service.getList<OrderBase>(PATH_ORDERS).push(order);
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

  // Return items attached to an order,
  // update item.key with the firebase key

  /**
   * Initialize state
   *
   * @returns {Promise<any>}
   */
  initialize(): Promise<any> {

    /**
     * Push the default settings into the /settings node
     */
    return new Promise<void>(() => { })
      .then(() =>
        this.subscriptions.push(this.service.getObject<number>(PATH_DEFAULT_TAX_PERCENT).valueChanges()
          .subscribe(tax => this.service.set(PATH_SETTINGS_TAX_PERCENT, tax))))
      .then(() =>
        this.subscriptions.push(this.service.getObject<number>(PATH_DEFAULT_TIP_PERCENT).valueChanges()
          .subscribe(tip => this.service.set(PATH_SETTINGS_TIP_PERCENT, tip))))
      .then(() =>
        this.subscriptions.push(this.service.getObject<number>(PATH_DEFAULT_DELIVERY).valueChanges()
          .subscribe(delivery => this.service.set(PATH_SETTINGS_DELIVERY, delivery))))
      .then(() =>
        this.subscriptions.push(this.service.getObject<boolean>(PATH_DEFAULT_SHOW_INTRO).valueChanges()
          .subscribe(show => this.service.set(PATH_SETTINGS_SHOW_INTRO, show))))
      .then(() =>
        this.subscriptions.push(this.service.getObject<TipBasis>(PATH_DEFAULT_TIP_OPTION).valueChanges()
          .subscribe(option => this.service.set(PATH_SETTINGS_TIP_OPTION, option))))
      .then(() =>
        this.subscriptions.push(this.service.getObject<ChangeBasis>(PATH_DEFAULT_CHANGE_OPTION).valueChanges()
          .subscribe(option => this.service.set(PATH_SETTINGS_CHANGE_OPTION, option))))
      .catch((err) => console.error('initialize error: ' + err));
  }
}
