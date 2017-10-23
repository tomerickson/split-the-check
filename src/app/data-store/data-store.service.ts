import { Injectable, OnDestroy } from '@angular/core';
import { DataProviderService } from '../data-provider/data-provider.service';
import { TipBasis } from '../model/tip-basis';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/defaultIfEmpty';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/publish';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/toPromise';
import { Order } from '../model/order';
// import { Thenable } from 'firebase/app';
import { Item } from '../model/item';
// import { FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { Settings } from '../model/settings';
import { ChangeBasis } from '../model/change-basis';
import { AngularFireList, AngularFireObject } from 'angularfire2/database';
import { Session } from '../model/session';
import { IDefault } from '../model/IDefault';
import { Defaults } from '../model/defaults';
import { AngularFirestoreDocument } from 'angularfire2/firestore';

const PATH_ROOT = '/root';
const PATH_ORDERS = '/orders/';
const PATH_ITEMS = '/items/';
const PATH_SETTINGS = '/settings';
const PATH_SESSION = '/orderSummary';
const PATH_TIP_OPTIONS_ENUM = '/enumerations/tipOptions';
const PATH_CHANGE_OPTIONS_ENUM = '/enumerations/changeOptions';
const PATH_DEFAULTS = '/root/defaults';
const PATH_DEFAULT_TAX_PERCENT = '/root/defaults/taxPercent';
const PATH_DEFAULT_TIP_PERCENT = '/defaults/tipPercent';
const PATH_DEFAULT_DELIVERY = '/defaults/delivery';
const PATH_DEFAULT_SHOW_INTRO = '/defaults/showIntro';
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

  private service: DataProviderService;
  private firstTime = true;

  public Orders: Order[] = [];
  public AllItems: Observable<Item[]>;
  public AllOrders: Observable<Order[]>;

  getTaxPercent = (): Observable<any> => {
    return this.service.getObject(PATH_SETTINGS_TAX_PERCENT);
  }
  getTipPercent = (): Observable<any> => {
    return this.service.getObject(PATH_SETTINGS_TIP_PERCENT);
  }
  getDelivery = () => {
    return this.service.getItem(PATH_SETTINGS_DELIVERY);
  }
  getChangeOption = () => {
    return this.service.getItem(PATH_SETTINGS_CHANGE_OPTION);
  }
  getTipOption = () => {
    return this.service.getItem(PATH_SETTINGS_TIP_OPTION);
  }

  mapOption = (source, destination) => {
    destination = source.$value;
    return destination;
  }

  constructor(private svc: DataProviderService) {
    this.service = svc;
    if (this.firstTime) {
      this.setDefaults();
    }
  }

  get session(): Observable<Session> {
    return this.service.getObject(PATH_SESSION);
  }

  get settings(): Observable<Settings> {
    return this.service.getObject(PATH_SETTINGS);
  }

  setSettings(settings: Settings) {
    this.service.set(PATH_SETTINGS, settings);
  }

  get changeBasis(): Observable<ChangeBasis> {
    return this.service.getObject(PATH_SETTINGS_CHANGE_OPTION);
  }

  get showIntro(): Observable<boolean> {
    return this.service.getObject(PATH_SETTINGS_SHOW_INTRO);
  }

  set showIntro(value) {
    this.service.set(PATH_SETTINGS_SHOW_INTRO, value);
  }


  setDefaults() {
    console.log('data-store.service.setDefaults');
    const defaults = this.service.getRawItem<Defaults>(PATH_DEFAULTS);
    let result: boolean;
    result = this.service.copyNode(PATH_DEFAULT_TAX_PERCENT, PATH_SETTINGS_TAX_PERCENT);
    if (result) {
      result = this.service.copyNode(PATH_DEFAULT_TIP_PERCENT, PATH_SETTINGS_TIP_PERCENT);
    }
    if (result) {
      result = this.service.copyNode(PATH_DEFAULT_DELIVERY, PATH_SETTINGS_DELIVERY);
    }
    /* if (result) {
      result = this.service.copyNode(PATH_DEFAULT_SHOW_INTRO, PATH_SETTINGS_SHOW_INTRO);
    }*/

    if (result) {
      this.AllItems = this.service.getList(PATH_ITEMS);
      this.AllOrders = this.service.getList(PATH_ORDERS);
    }
    this.firstTime = false;
  }

  ngOnDestroy() {
    // this.service.afs.app.database().goOffline();
  }

  setDefaultTipOption(option: TipBasis): boolean {
    try {
      this.service.set(PATH_SETTINGS_TIP_OPTION, option);
      return true;
    } catch (e) {
      return false;
    }
  }

  setDefaultChangeOption(option: ChangeBasis): boolean {
    try {
      this.service.set(PATH_SETTINGS_CHANGE_OPTION, option);
      return true;
    } catch (e) {
      return false;
    }
  }

  getDefaultTipOption() {
    const obj = this.service.query(PATH_TIP_OPTIONS_ENUM, FILTER_DEFAULT_OPTION);
    return obj.take(1)[0];
  }

  getDefaultChangeOption(): ChangeBasis {
    const obj = this.service.query(PATH_CHANGE_OPTIONS_ENUM, FILTER_DEFAULT_OPTION);
    return obj.take(1)[0];
  }

  getTipOptions(): Observable<TipBasis[]> {
    // return this.service.getList(PATH_ENUM_TIP_OPTIONS);
    return this.service.query(PATH_ENUM_TIP_OPTIONS, CHANGE_OPTIONS_SORT);
  }

  getChangeOptions(): Observable<ChangeBasis[]> {
    // return this.service.getList(PATH_ENUM_CHANGE_OPTIONS);
    return this.service.query(PATH_ENUM_CHANGE_OPTIONS, CHANGE_OPTIONS_SORT);
  }

  toggleShowIntro(choice: boolean) {
    this.service.set(PATH_SETTINGS, {showIntro: choice});
  }

  setTaxPercent(value: number) {
    this.service.set(PATH_SETTINGS, {taxPercent: value});
  }

  setTipPercent(value: number) {
    this.service.set(PATH_SETTINGS, {tipPercent: value});
  }

  setDelivery(value: number) {
    this.service.set(PATH_SETTINGS, {delivery: value});
  }

  setChangeBasis(changeBasis) {
//    debugger;
    this.service.set(PATH_SETTINGS_CHANGE_OPTION, changeBasis);
  }

  setTipBasis(tipBasis: TipBasis) {
    this.service.set(PATH_SETTINGS_TIP_OPTION, tipBasis);
  }

  wrapUp() {
    this.service.remove(PATH_ORDERS);
    this.service.remove(PATH_ITEMS);
  }

// Order-list
//
  getOrders(): Observable<Order[]> {
    return this.service.getList<Order>(PATH_ORDERS);
  }

// Order level queries
//
  addOrder() {
    this.service.push<IOrder>(PATH_ORDERS, {key: null, name: null, paid: 0});
  }

  removeOrder(key: string) {
    this.service.remove(PATH_ORDERS + key);
  }

  getOrder(key: string): Observable<Order> {
    return this.service.getItem<Order>(PATH_ORDERS + key);
  }

  getPaid(key: string): Observable<number> {
    return this.service.getObject<number>(PATH_ORDERS + key + '/paid');
  }

// Return items attached to an order,
// update item.key with the firebase key
//
  getItems(orderId: string): Observable<any> {
    const filter = {orderByChild: 'orderId', equalTo: orderId};
    return this.service.query(PATH_ITEMS, filter);
    /*.map(element => {
      return element;
    });*/
  }

  // Return the $value property of the incoming key/value pair
  // patched with the $key property.

  updateOrder(key: string, updates: object) {
    this.service.getItemWithKey<Order>(PATH_ORDERS + key).update(updates);
  }

//
  addItem(orderId: string) {
    this.service.push<IItem>(PATH_ITEMS, {
      orderId: orderId,
      description: null, quantity: null, price: null, instructions: null, key: null
    })
  }

// Item-level queries

  removeItem(itemId: string) {
    this.service.remove(PATH_ITEMS + itemId);
  }
/*
  getItem(key: string): FirebaseObjectObservable<any> {
    return this.service.getItem(PATH_ITEMS + key);
  }

  getItemField(key: string, field: string): FirebaseObjectObservable<any> {
    let path = PATH_ITEM.replace('\[key\]', key);
    path = path.replace('\[value\]', field);
    const result = this.service.getItem(path);
    console.log(result.$ref.toJSON());
    return this.service.getItem(path);
  }
*/
  updateItem(item: Item) {
    const foo = this.service.getItemWithKey<Item>(PATH_ITEMS + item.key);
    return foo.update(item);
  }

//
  mockQuery(): Observable<TipBasis[]> {
    return this.service.mockQuery();
  }

// App-level queries

  //
  private patchKey(kvp: { $key, $value }) {
    const result = kvp.$value;
    result['key'] = kvp.$key;
    return result;
  }
}
