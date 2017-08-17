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
import { ChangeBasis } from '../model/change-basis';
import { Order } from '../model/order';
import { Thenable } from 'firebase/app';
import { Item } from '../model/item';
import { FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { ObjectFactory } from '../model/ObjectFactory';
import { Change } from '@angular/cli/lib/ast-tools';

const PATH_ORDERS = '/orders/';
const PATH_ITEMS = '/items/';
const PATH_SETTINGS = '/settings';
const PATH_SESSION = '/orderSummary';
const PATH_TIP_OPTIONS_ENUM = '/enumerations/tipOptions';
const PATH_CHANGE_OPTIONS_ENUM = '/enumerations/changeOptions';
const PATH_DEFAULT_TAX_PERCENT = '/defaults/taxPercent';
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

@Injectable()
export class DataStoreService implements OnDestroy {

  public Orders: Order[] = [];
  public AllItems: FirebaseListObservable<any>;
  public AllOrders: FirebaseListObservable<any>;
  getTaxPercent = (): FirebaseObjectObservable<any> => {
    return this.service.getItem(PATH_SETTINGS_TAX_PERCENT);
  }
  getTipPercent = (): FirebaseObjectObservable<any> => {
    return this.service.getItem(PATH_SETTINGS_TIP_PERCENT);
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
  private service: DataProviderService;
  private firstTime = true;


  // Settings

  constructor(private svc: DataProviderService) {
    this.service = svc;
    if (this.firstTime) {
      this.service.db.app.database().goOnline();
      this.setDefaults();
    }
  }

  get session(): FirebaseObjectObservable<any> {
    return this.service.getItem(PATH_SESSION);
  }

  get settings(): FirebaseObjectObservable<any> {
    return this.service.getItem(PATH_SETTINGS);
  }

  get changeBasis(): FirebaseObjectObservable<any> {
    return this.service.getItem(PATH_SETTINGS_CHANGE_OPTION);
  }

  setDefaults() {
    let result: boolean;
    result = this.service.copyNode(PATH_DEFAULT_TAX_PERCENT, PATH_SETTINGS_TAX_PERCENT);
    if (result) {
      this.service.copyNode(PATH_DEFAULT_TIP_PERCENT, PATH_SETTINGS_TIP_PERCENT);
    }
    if (result) {
      this.service.copyNode(PATH_DEFAULT_DELIVERY, PATH_SETTINGS_DELIVERY);
    }
    if (result) {
      this.service.copyNode(PATH_DEFAULT_SHOW_INTRO, PATH_SETTINGS_SHOW_INTRO);
    }

    if (result) {
      this.getDefaultTipOption().then(data => {
        this.service.updatePath(PATH_SETTINGS_TIP_OPTION, data);
      })
    }
    if (result) {
      this.getDefaultChangeOption().then(data => {
        this.service.updatePath(PATH_SETTINGS_CHANGE_OPTION, data);
      });
      this.AllItems = this.service.getList(PATH_ITEMS);
      this.AllOrders = this.service.getList(PATH_ORDERS);
    }
    this.firstTime = false;
  }

  ngOnDestroy() {
    this.service.db.app.database().goOffline();
  }

  //
  getDefaultTipOption(): Promise<TipBasis> {
    return this.service.query(PATH_TIP_OPTIONS_ENUM, FILTER_DEFAULT_OPTION)
      .first(opt => opt.isDefault)
      .toPromise()
  }

  getDefaultChangeOption(): Promise<ChangeBasis> {
    return this.service.query(PATH_CHANGE_OPTIONS_ENUM, FILTER_DEFAULT_OPTION)
      .first(opt => opt.isDefault)
      .toPromise();
  }

  getTipOptions(): Observable<TipBasis[]> {
    return this.service.getList(PATH_ENUM_TIP_OPTIONS)
      .map(array => array.map(item => ObjectFactory.CreateTipBasisFromJSON(item)));
  }

  getChangeOptions(): Observable<ChangeBasis[]> {
    return this.service.getList(PATH_ENUM_CHANGE_OPTIONS)
      .map(array => array.map(item => ObjectFactory.CreateChangeBasisFromJSON(item)))
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
    debugger;
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
  getOrders(): FirebaseListObservable<any> {
    return this.service.getList(PATH_ORDERS);
  }

// Order level queries
//
  addOrder(): Thenable<IOrder> {
    return this.service.push<IOrder>(PATH_ORDERS, {key: null, name: null, paid: 0});
  }

  removeOrder(key: string) {
    const fbo = this.service.getItem(PATH_ORDERS + key) as FirebaseObjectObservable<any>;
    return fbo.remove();
  }

  getOrder(key: any): FirebaseObjectObservable<any> {
    return this.service.getItem(PATH_ORDERS + key)
  }

  getPaid(key: string): Observable<number> {
    return this.service.getItem(PATH_ORDERS + key + '/paid');
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

  updateOrder(key: string, updates: object): Thenable<any> {
    const foo = this.service.getItem(PATH_ORDERS + key) as FirebaseObjectObservable<Order>;
    return foo.update(updates);
  }

//
  addItem(orderId: string): Thenable<any> {
    return this.service.push<IItem>(PATH_ITEMS, {
      orderId: orderId,
      description: null, quantity: null, price: null, instructions: null, key: null
    })
  }

// Item-level queries

  removeItem(itemId: string) {
    const fbo = this.service.getItem(PATH_ITEMS + itemId) as FirebaseObjectObservable<Item>;
    return fbo.remove();
  }

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

  updateItem(item: Item): Thenable<any> {
    const foo = this.service.getItem(PATH_ITEMS + item.key) as FirebaseObjectObservable<Item>;
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
