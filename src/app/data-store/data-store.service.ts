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
import {Thenable} from "firebase/app";
import {Item} from "../model/item";
import {FirebaseListObservable, FirebaseObjectObservable} from "angularfire2/database";
import {Session} from "../model/session";
import {Settings} from "../model/settings";

const PATH_ORDERS = '/orders/';
const PATH_ITEMS = '/items/';
const PATH_SETTINGS = '/settings';
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
const FILTER_DEFAULT_OPTION = {orderByChild: 'isDefault', equalTo: true, limitToFirst: 1};

@Injectable()
export class DataStoreService implements OnDestroy {

  private service: DataProviderService;
  private firstTime: boolean = true;

  Orders: Order[] = [];
  Items: Item[] = [];

  AllItems: FirebaseListObservable<any>;
  AllOrders: FirebaseListObservable<any>;

  constructor(private svc: DataProviderService) {
    this.service = svc;
    // TODO: Initialize TipBasis and ChangeBasis from defaults
    //
    if (this.firstTime) {
      this.service.db.app.database().goOnline();
      this.setDefaults();
    }
  }

  sessionLink(session: Session) {
    return Observable.zip(this.AllOrders,
      this.AllItems,
      this.settings)
      .map(([orders, items, settings]) => {
        session.orders = orders;
        session.items = items;
        session.settings.salesTaxPercent = settings.taxPercent;
        session.settings.tipPercent = settings.tipPercent;
        session.settings.changeBasis = settings.changeOption;
        session.settings.tipBasis = settings.tipOption;
        session.settings.delivery = settings.delivery;
        session.settings.showIntro = settings.showIntro;
      }).toPromise();
  }

  orderLink(order: Order): Observable<Order> {
    let result: Observable<Order> = null;
    new Promise<Observable<Order>>(() =>
      Observable.zip(this.getOrder(order.key),
        this.getItems(order.key),
        this.settings)
        .map(([ord, items, settings]) => {
          order.items = items;
          order.settings.salesTaxPercent = settings.taxPercent;
          order.settings.tipPercent = settings.tipPercent;
          order.settings.changeBasis = settings.changeOption;
          order.settings.tipBasis = settings.tipOption;
          order.settings.delivery = settings.delivery;
          order.settings.showIntro = settings.showIntro;
        }))
      .then((observed) => {
        result = observed
      })
      .catch((e) => console.error(e));
    return result;
  }

  get settings(): FirebaseObjectObservable<any> {
    return this.service.getItem(PATH_SETTINGS);
  }

  setDefaults() {
    let result: boolean;
    result = this.service.copyNode(PATH_DEFAULT_TAX_PERCENT, PATH_SETTINGS_TAX_PERCENT);
    if (result) this.service.copyNode(PATH_DEFAULT_TIP_PERCENT, PATH_SETTINGS_TIP_PERCENT);
    if (result) this.service.copyNode(PATH_DEFAULT_DELIVERY, PATH_SETTINGS_DELIVERY);
    if (result) this.service.copyNode(PATH_DEFAULT_SHOW_INTRO, PATH_SETTINGS_SHOW_INTRO);

    if (result) {
      this.getDefaultTipOption().then(data => {
        this.service.updatePath(PATH_SETTINGS_TIP_OPTION, data);
      })
    }
    if (result) {
      this.getDefaultChangeOption().then(data => {
        this.service.updatePath(PATH_SETTINGS_CHANGE_OPTION, data);
      })
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

  setDelivery(value: number) {
    this.service.set(PATH_SETTINGS_DELIVERY, +value);
  }

  setChangeBasis(index: number) {
    let changeBasis: ChangeBasis;
    let obs = this.service.getList(PATH_ENUM_CHANGE_OPTIONS);
    let sub = obs.subscribe(opt => changeBasis = opt[index]);
    sub.unsubscribe();
    this.service.updatePath(PATH_SETTINGS_CHANGE_OPTION, changeBasis);
  }

  setTipBasis(index: number) {
    let tipBasis: TipBasis;
    let obs = this.service.getList(PATH_ENUM_TIP_OPTIONS);
    let sub = obs.subscribe(tip => tipBasis = tip[index]);
    sub.unsubscribe();
    this.service.updatePath(PATH_SETTINGS_TIP_OPTION, tipBasis);
  }

  wrapup() {
    this.service.remove(PATH_ORDERS);
    this.service.remove(PATH_ITEMS);
  }

  createOrder(): Thenable<Order> {
    let order: Observable<Order>;
    return this.addOrder()
  }

  // Order level queries
  //
  addOrder(): Thenable<Order> {
    let order: Order = new Order();
    return this.service.push<Order>(PATH_ORDERS, order);
  }

  removeOrder(key: string) {
    let fbo = this.service.getItem(PATH_ORDERS + key) as FirebaseObjectObservable<Order>;
    return fbo.remove();
  }

  getOrder(key: any): FirebaseObjectObservable<Order> {
    return this.service.getItem(PATH_ORDERS + key);
  }

  getPaid(key: string): Observable<number> {
    return this.service.getItem(PATH_ORDERS + key + '/paid');
  }

  getItems(orderId: string) {
    return this.service.getList(PATH_ITEMS + orderId);
  }

  updateOrder(key: string, updates: object): Thenable<any> {
    let foo = this.service.getItem(PATH_ORDERS + key) as FirebaseObjectObservable<Order>;
    return foo.update(updates);
  }

  setPaid(order: Order, paid: number) {

  }


  // Item-level queries
  //
  addItem(orderKey: string): Thenable<Item> {
    const item = new Item(orderKey);
    return this.service.push<Item>(PATH_ITEMS, item)
  }

  removeItem(item: Item) {
    let fbo = this.service.getItem(PATH_ITEMS + item.key) as FirebaseObjectObservable<Item>;
    return fbo.remove();
  }

  getItem(key: string) {
    return this.service.getItem(PATH_ITEMS + key);
  }

  updateItem(item: Item, updates: object): Thenable<any> {
    let foo = this.service.getItem(PATH_ITEMS + item.key) as FirebaseObjectObservable<Item>;
    return foo.update(updates);
  }

  // App-level queries
  //
  mockQuery(): Observable<TipBasis[]> {
    return this.service.mockQuery();
  }
}
