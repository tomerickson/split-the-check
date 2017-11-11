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
import { ChangeBasis, Defaults, IItem, IOrder, Item, Order, Session, Settings, TipBasis } from '../model';
import { AngularFireList, QueryFn } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';

const PATH_ORDERS = '/orders/';
const PATH_ITEMS = '/items/';
const PATH_SETTINGS = '/settings';
const PATH_SESSION = '/orderSummary';
const PATH_TIP_OPTIONS_ENUM = '/enumerations/tipOptions';
const PATH_CHANGE_OPTIONS_ENUM = '/enumerations/changeOptions';
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

  private service: DataProviderService;
  private firstTime = true;
  private _allOrders: BehaviorSubject<IOrder[]>;
  private _allItems: BehaviorSubject<IItem[]>;
  private _session: Observable<Session>;
  private _settings: BehaviorSubject<Settings>;
  private _orderSub: Subscription;
  private _itemSub: Subscription;
  private _sessionSub: Subscription;
  private _settingsSub: Subscription = null;

  public Orders: Order[] = [];

  changeOption: BehaviorSubject<ChangeBasis>;
  tipOption: BehaviorSubject<TipBasis>;
  delivery: BehaviorSubject<number>;
  tipPercent: BehaviorSubject<number>;
  taxPercent: BehaviorSubject<number>;

  static orderByValueFilter(ref): QueryFn {
    return ref.orderByChild('value');
  };

  static findDefaultValueFilter(ref): QueryFn {
    return ref.orderByChild('isDefault').equalTo(true).limitToFirst(1);
  };


  getTaxPercent = (): Observable<number> => {
    return this.service.getItem<number>(PATH_SETTINGS_TAX_PERCENT).valueChanges();
  };
  getTipPercent = (): Observable<number> => {
    return this.service.getItem<number>(PATH_SETTINGS_TIP_PERCENT).valueChanges();
  };
  getDelivery = () => {
    return this.service.getItem(PATH_SETTINGS_DELIVERY);
  };
  getChangeOption = () => {
    return this.service.getItem(PATH_SETTINGS_CHANGE_OPTION);
  };
  getTipOption = () => {
    return this.service.getItem(PATH_SETTINGS_TIP_OPTION);
  };

  mapOption = (source, destination) => {
    destination = source.$value;
    return destination;
  };

  get allOrders() {
    if (this._orderSub === null) {
      this._orderSub = this.service.getList<IOrder>(PATH_ORDERS).valueChanges<IOrder>()
        .subscribe((obs) => this._allOrders.next(obs));
    }
    return this._allOrders;
  }

  get allItems() {
    if (this._itemSub === null) {
      this._itemSub = this.service.getList<IItem>(PATH_ITEMS).valueChanges<IItem>()
        .subscribe(obs => this._allItems.next(obs));
    }
    return this._allItems;
  }

  get session(): Observable<Session> {
    if (this._sessionSub === null) {
      this._sessionSub = this.service.getItem<Session>(PATH_SESSION).valueChanges<Session>()
        .subscribe(obs => this._session = Observable.of(obs));
    }
    return this._session;
  }

  get settings(): BehaviorSubject<Settings> {
    if (this._settingsSub === null) {
      this._settingsSub = this.service.getItem<Settings>(PATH_SETTINGS).valueChanges<Settings>()
        .subscribe(obs => this._settings.next(obs));
      this.settings.subscribe(settings => {
        this.changeOption.next(settings.changeOption);
        this.tipOption.next(settings.tipOption);
        this.delivery.next(settings.delivery);
        this.taxPercent.next(settings.taxPercent);
        this.tipPercent.next(settings.tipPercent);
      });
    }
    return this._settings;
  }

  constructor(private svc: DataProviderService) {
    this.service = svc;
    if (this.firstTime) {
      this.setDefaults();
    }
  }

  get showIntro(): Observable<boolean> {
    return this.service.getItem(PATH_SETTINGS_SHOW_INTRO).valueChanges<boolean>();
  }

  set showIntro(value) {
    this.service.set(PATH_SETTINGS_SHOW_INTRO, value);
  }


  setSettings(settings: Settings) {
    this.service.set(PATH_SETTINGS, settings);
  }

  getSettings(): Observable<Settings> {
    return this.service.getItem<Settings>(PATH_SETTINGS).valueChanges<Settings>();
  }

  unwrapItem<T>(observable: Observable<T>): T {
    const result: T = null;
    const subscription = observable.subscribe(obs => Object.assign(result, obs));
    subscription.unsubscribe();
    return result;
  }

  setDefaults() {
    console.log('entering data-store.service.setDefaults');
    this.service.getItem<Defaults>(PATH_DEFAULTS).valueChanges().map((obs: Observable<Defaults>) => {
      let result: boolean = this.service.copyNode(PATH_DEFAULT_TAX_PERCENT, PATH_SETTINGS_TAX_PERCENT);

      if (result) {
        result = this.service.copyNode(PATH_DEFAULT_TIP_PERCENT, PATH_SETTINGS_TIP_PERCENT);
      }

      if (result) {
        result = this.service.copyNode(PATH_DEFAULT_DELIVERY, PATH_SETTINGS_DELIVERY);
      }

      this.firstTime = false;
      console.log('exiting data-store.service.setDefaults');
    });
  }

  ngOnDestroy() {
    this._orderSub.unsubscribe();
    this._itemSub.unsubscribe();
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

  getDefaultTipOption(): Observable<TipBasis> {
    const query = {
      orderByChild: 'isDefault',
      equalTo: true,
      limitToFirst: 1
    }
    const qry: AngularFireList<TipBasis> = this.service.query<TipBasis>(PATH_TIP_OPTIONS_ENUM, query)
    return qry.valueChanges().take(1)[0];
  }

  getDefaultChangeOption(): Observable<ChangeBasis> {
    const qry = this.service.query<ChangeBasis>(PATH_CHANGE_OPTIONS_ENUM, DataStoreService.findDefaultValueFilter);
    return qry.valueChanges().take(1)[0];
  }

  getTipOptions(): Observable<TipBasis[]> {
    console.log('entering getTipOptions');
    const query: any = {
      orderByChild: 'value'
    }
    return this.service.query<TipBasis>(PATH_ENUM_TIP_OPTIONS, query)
      .valueChanges() as Observable<TipBasis[]>;
  }

  getChangeOptions(): Observable<ChangeBasis[]> {
    console.log('entering getChangeOptions');
    const query: any = {
      orderByChild: 'value'
    }
    return this.service.query<ChangeBasis>(PATH_ENUM_CHANGE_OPTIONS, query)
      .valueChanges() as Observable<ChangeBasis[]>;
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
    return this.service.getList<Order>(PATH_ORDERS).valueChanges();
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
    return this.service.getItem<Order>(PATH_ORDERS + key).valueChanges<Order>();
  }

  getPaid(key: string): Observable<number> {
    return this.service.getItem<number>(PATH_ORDERS + key + '/paid').valueChanges<number>();
  }

  // Return items attached to an order,
  // update item.key with the firebase key
  //
  getItems(orderId: string): Observable<Item[]> {
    const filter = {orderByChild: 'orderId', equalTo: orderId};
    return this.service.query(PATH_ITEMS, filter).valueChanges();
  }

  // Return the $value property of the incoming key/value pair
  // patched with the $key property.

  updateOrder(key: string, updates) {
    this.service.updateObject<Order>(PATH_ORDERS + key, updates);
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
    return this.service.updateObject<Item>(PATH_ITEMS + item.key, item);
  }

  //
  mockQuery(): Observable<TipBasis[]> {
    return this.service.mockQuery().valueChanges();
  }

  // App-level queries

  //
  private patchKey(kvp: { $key, $value }) {
    const result = kvp.$value;
    result['key'] = kvp.$key;
    return result;
  }

}
