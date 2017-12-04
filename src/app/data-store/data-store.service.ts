import { Injectable, OnDestroy } from '@angular/core';
import { DataProviderService } from '../data-provider/data-provider.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/defaultIfEmpty';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/publish';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/toPromise';
import { ChangeBasis, IItem, IOrder, Item, Order, Session, Settings, TipBasis } from '../model';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/from';

const PATH_ORDERS = '/orders/';
const PATH_ITEMS = '/items/';
const PATH_SETTINGS = '/settings';
const PATH_SESSION = '/orderSummary';
const PATH_DEFAULTS = '/defaults';
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
const CHANGE_OPTIONS_SORT = {orderByChild: 'value'};


@Injectable()
export class DataStoreService implements OnDestroy {

  public firstTime = true;
  public allOrders: BehaviorSubject<any[]>;
  public allItems: BehaviorSubject<any[]>;
  public changeOption: BehaviorSubject<ChangeBasis>;
  public changeOptions: ChangeBasis[];
  public delivery: BehaviorSubject<number>;
  public session: BehaviorSubject<Session>;
  public settings: BehaviorSubject<Settings>;
  public showIntro: BehaviorSubject<boolean>;
  public tipOption: BehaviorSubject<TipBasis>;
  public tipOptions: BehaviorSubject<TipBasis[]>;
  public tipPercent: BehaviorSubject<number>;
  public taxPercent: BehaviorSubject<number>;
  private service: DataProviderService;
  private subscriptions: Array<Subscription>;

  constructor(private svc: DataProviderService) {
    this.service = svc;
    this.subscriptions = [];
    this.taxPercent = new BehaviorSubject<number>(0);
    this.allOrders = new BehaviorSubject<IOrder[]>(null);
    this.allItems = new BehaviorSubject<IItem[]>(null);
    this.changeOption = new BehaviorSubject<ChangeBasis>(null);
    // this.changeOptions = new BehaviorSubject<ChangeBasis[]>(null);
    this.delivery = new BehaviorSubject<number>(null);
    this.session = new BehaviorSubject<Session>(null);
    this.settings = new BehaviorSubject<Settings>(null);
    this.showIntro = new BehaviorSubject<boolean>(null);
    this.tipOption = new BehaviorSubject<TipBasis>(null);
    this.tipOptions = new BehaviorSubject<TipBasis[]>(null);
    this.tipPercent = new BehaviorSubject<number>(0);
    this.initialize();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  toggleShowIntro(choice: boolean) {
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
    this.service.push<IOrder>(PATH_ORDERS, {key: null, name: null, paid: 0});
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
  getItems(orderId: string): Observable<Item[]> {
    let result: Observable<Item[]> = null;
    const filter = {orderByChild: 'orderId', equalTo: orderId};
    // return this.service.query(PATH_ITEMS, filter).valueChanges();
    this.service.query(PATH_ITEMS, filter)
      .map(snap => snap.forEach(thing => result = thing.payload.val()));
    return result;
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
   * Clone the settings from the /defaults node to
   * the /settings node.
   *
   * @returns {Promise<any>}
   */
  private setDefaults(): Promise<any> {
    console.log('entering data-store.service.setDefaults');

    let promise = this.service.getItem<number>(PATH_DEFAULT_TAX_PERCENT).valueChanges()
      .take(1).do(tax => this.service.set(PATH_SETTINGS_TAX_PERCENT, tax)).toPromise<any>();

    promise.then(() => {
      promise = this.service.getItem<number>(PATH_DEFAULT_TIP_PERCENT).valueChanges()
        .take(1).do(tip => this.service.set(PATH_SETTINGS_TIP_PERCENT, tip)).toPromise<any>();
    });

    promise.then(() => {
      promise = this.service.getItem<number>(PATH_DEFAULT_DELIVERY).valueChanges()
        .take(1).do(delivery => this.service.set(PATH_SETTINGS_DELIVERY, delivery)).toPromise<any>();
    });

    promise.then(() => {
      promise = this.service.getItem<boolean>(PATH_DEFAULT_SHOW_INTRO).valueChanges()
        .take(1).do(showTip => this.service.set(PATH_SETTINGS_SHOW_INTRO, showTip)).toPromise<any>();
    });

    promise.then(() => {
      promise = this.service.query<TipBasis>(PATH_ENUM_TIP_OPTIONS,
        ref => ref.orderByChild('isDefault').equalTo(true)
          .limitToFirst(1)).take(1)
        .do(tipBasis => this.service.set(PATH_SETTINGS_TIP_OPTION, tipBasis[0].payload.val())).toPromise<any>();
    });

    promise.then(() => {
      promise = this.service.query<ChangeBasis>(PATH_ENUM_CHANGE_OPTIONS,
        ref => ref.orderByChild('isDefault').equalTo(true)
          .limitToFirst(1)).take(1)
        .do(chgBasis => this.service.set(PATH_SETTINGS_CHANGE_OPTION, chgBasis[0].payload.val())).toPromise<any>();
    });

    return promise;
  }

  /**
   * Create subscriptions for the current settings
   *
   * @param {Promise<any>} promise
   * @returns {Promise<any>}
   */
  private subscribeAll(promise: Promise<any>): Promise<any> {

    console.log('entering subscribeAll');
    let path = PATH_ITEMS;

    try {
      this.subscriptions.push(this.service.getList(path)
        .valueChanges()
        .subscribe(obs => this.allItems.next(obs)));

      path = PATH_ORDERS;
      this.subscriptions.push(this.service.getList<IOrder>(path)
        .valueChanges()
        .subscribe(obs => this.allOrders.next(obs)));

      path = PATH_SESSION;
      this.subscriptions.push(this.service.getItem<Session>(path)
        .valueChanges()
        .subscribe(obs => this.session.next(obs)));

      path = PATH_SETTINGS_TAX_PERCENT;
      this.subscriptions.push(this.service.getItem<number>(path)
        .valueChanges().subscribe(obs => this.taxPercent.next(obs)));

      path = PATH_SETTINGS_TIP_PERCENT;
      this.subscriptions.push(this.service.getItem<number>(path)
        .valueChanges()
        .subscribe(obs => this.tipPercent.next(obs)));

      path = PATH_SETTINGS_DELIVERY;
      this.subscriptions.push(this.service.getItem<number>(path)
        .valueChanges()
        .subscribe(obs => this.delivery.next(obs)));

      path = PATH_SETTINGS_SHOW_INTRO;
      this.subscriptions.push(this.service.getItem<boolean>(path)
        .valueChanges()
        .subscribe(obs => this.showIntro.next(obs)));

      path = PATH_SETTINGS_CHANGE_OPTION;
      this.subscriptions.push(this.service.getItem<ChangeBasis>(path)
        .valueChanges()
        .subscribe(obs => this.changeOption.next(obs)));

      path = PATH_SETTINGS_TIP_OPTION;
      this.subscriptions.push(this.service.getItem<TipBasis>(path)
        .valueChanges()
        .subscribe(obs => this.tipOption.next(obs)));

      path = PATH_ENUM_CHANGE_OPTIONS;
      this.subscriptions.push(this.service.getList<ChangeBasis>(path)
        .valueChanges().subscribe(obs => {
          this.changeOptions = [];
          obs.map(opt => this.changeOptions.push(opt))
        }));

      path = PATH_ENUM_TIP_OPTIONS;
      this.subscriptions.push(this.service.getList<TipBasis>(path)
        .valueChanges()
        .subscribe(obs => this.tipOptions.next(obs)));

    } catch (err) {
      this.service.logFailure('subscribeAll', path, null, err);
    }
    return promise;
  }

  /**
   * Initialize state
   *
   * @returns {Promise<any>}
   */
  private initialize() {
    let promise: Promise<any>;
    if (this.firstTime) {
      promise = this.setDefaults()
        .then(() =>
          promise = this.subscribeAll(promise)
            .then(() => {
              this.firstTime = false;
              console.log('changeOptions:' + JSON.stringify(this.changeOptions));
            })
            .catch(err => console.log('subscribeAll failed: ' + JSON.stringify(err))))
        .catch(err => console.log('setDefaults failed: ' + JSON.stringify(err)));
    }
  }
}
