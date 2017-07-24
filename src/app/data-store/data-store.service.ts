import {Injectable, OnDestroy} from '@angular/core';
import {DataProviderService} from '../data-provider/data-provider.service';
import {TipBasis} from '../model/tip-basis';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/defaultIfEmpty';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/publish';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/toPromise';
import {ChangeBasis} from '../model/change-basis';
import {Order} from '../model/order';
import {Thenable} from 'firebase/app';
import {Item} from '../model/item';
import {FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import {Settings} from '../model/settings';
import {Subscription} from 'rxjs/Subscription';

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

  private service: DataProviderService;
  private firstTime = true;

  Orders: Order[] = [];

  AllItems: FirebaseListObservable<any>;
  AllOrders: FirebaseListObservable<any>;

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

  // Settings
  //
  getDefaultTipOption(): Promise<TipBasis> {
    return this.service.query(PATH_TIP_OPTIONS_ENUM, FILTER_DEFAULT_OPTION)
      .first()
      .map(options => options[0])
      .toPromise()
  }

  getDefaultChangeOption(): Promise<ChangeBasis> {
    return this.service.query(PATH_CHANGE_OPTIONS_ENUM, FILTER_DEFAULT_OPTION)
      .first()
      .map(options => options[0])
      .toPromise();
  }

  getTipOptions() {
    return this.service.query(PATH_ENUM_TIP_OPTIONS, {});
  }

  getChangeOptions() {
    return this.service.query(PATH_ENUM_CHANGE_OPTIONS, {});
  }

  toggleShowIntro(choice: boolean) {
    this.service.set(PATH_SETTINGS_SHOW_INTRO, choice);
  }

  setTaxPercent(value: number) {
    this.service.set(PATH_SETTINGS_TAX_PERCENT, +value);
  }

  setTipPercent(value: number) {
    this.service.set(PATH_SETTINGS_TIP_PERCENT, +value);
  }

  getDelivery() {
    return this.service.getItem(PATH_SETTINGS_DELIVERY);
  }

  setDelivery(value: number) {
    let obj: Settings;
    let sub: Subscription;
    sub = this.service.getItem(PATH_SETTINGS).subscribe(settings => {
      obj = Object.assign({}, settings.valueOf());
      obj.delivery = +value;
      this.service.set(PATH_SETTINGS, obj);
    });
    sub.unsubscribe();
  }

  setChangeBasis(index: number) {
    let changeBasis: ChangeBasis;
    const obs = this.service.getList(PATH_ENUM_CHANGE_OPTIONS);
    const sub = obs.subscribe(opt => changeBasis = opt[index]);
    sub.unsubscribe();
    if (changeBasis) {
      this.service.updatePath(PATH_SETTINGS_CHANGE_OPTION, changeBasis);
    }
  }

  setTipBasis(index: number) {
    let tipBasis: TipBasis;
    const obs = this.service.getList(PATH_ENUM_TIP_OPTIONS);
    const sub = obs.subscribe(tip => tipBasis = tip[index]);
    sub.unsubscribe();
    if (tipBasis) {
      this.service.updatePath(PATH_SETTINGS_TIP_OPTION, tipBasis);
    }
  }

  wrapup() {
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
  getItems(orderId: string): FirebaseListObservable<any> {
    const filter = {orderByChild: 'orderId', equalTo: orderId};
    return this.service.query(PATH_ITEMS, filter);
      // .map(items => items.map(item => item.key = item.$key));
      /*.map(items => items.map(item => {
        const newItem: Item = Object.assign({}, item);
        newItem.key = item.$key;
        return newItem;
      }*/
  }

  updateOrder(key: string, updates: object): Thenable<any> {
    const foo = this.service.getItem(PATH_ORDERS + key) as FirebaseObjectObservable<Order>;
    return foo.update(updates);
  }

// Item-level queries
//
  addItem(orderId: string): Thenable<any> {
    return this.service.push<IItem>(PATH_ITEMS, {
      orderId: orderId,
      description: null, quantity: null, price: null, instructions: null, key: null
    })
  }

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

// App-level queries
//
  mockQuery(): Observable<TipBasis[]> {
    return this.service.mockQuery();
  }
}
