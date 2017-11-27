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

  static firstTime = true;
  public allOrders: BehaviorSubject<any[]>;
  public allItems: BehaviorSubject<any[]>;
  public changeOption: BehaviorSubject<ChangeBasis>;
  public changeOptions: BehaviorSubject<any[]>;
  public delivery: BehaviorSubject<number>;
  public session: BehaviorSubject<Session>;
  public settings: BehaviorSubject<Settings>;
  public showIntro: BehaviorSubject<boolean>;
  public taxPercent: BehaviorSubject<number>;
  public tipOption: BehaviorSubject<TipBasis>;
  public tipOptions: BehaviorSubject<TipBasis[]>;
  public tipPercent: BehaviorSubject<number>;
  private service: DataProviderService;
  private _allItemsSub: Subscription = null;
  private _allOrdersSub: Subscription = null;
  private _changeOptionsSub: Subscription = null;
  private _changeOptionSub: Subscription = null;
  private _deliverySub: Subscription = null;
  private _orderSub: Subscription = null;
  private _sessionSub: Subscription = null;
  private _settingsSub: Subscription = null;
  private _showIntroSub: Subscription = null;
  private _taxPercentSub: Subscription = null;
  private _tipOptionsSub: Subscription = null;
  private _tipOptionSub: Subscription = null;
  private _tipPercentSub: Subscription = null;

  constructor(private svc: DataProviderService) {
    this.service = svc;
    this.allOrders = new BehaviorSubject<IOrder[]>(null);
    this.allItems = new BehaviorSubject<IItem[]>(null);
    this.changeOption = new BehaviorSubject<ChangeBasis>(null);
    this.changeOptions = new BehaviorSubject<ChangeBasis[]>(null);
    this.delivery = new BehaviorSubject<number>(null);
    this.session = new BehaviorSubject<Session>(null);
    this.settings = new BehaviorSubject<Settings>(null);
    this.showIntro = new BehaviorSubject<boolean>(null);
    this.tipOption = new BehaviorSubject<TipBasis>(null);
    this.tipOptions = new BehaviorSubject<TipBasis[]>(null);
    this.tipPercent = new BehaviorSubject<number>(0);
    this.taxPercent = new BehaviorSubject<number>(0);
    this.initialize();


  }

  private initialize(): Promise<void> {
    return new Promise(() => this.setDefaults()).then(() => {
      if (DataStoreService.firstTime) {
        this.subscribeAll()
          .then(() => this.setDefaultChangeOption(this.changeOption.getValue())
            .then(() => this.setDefaultTipOption(this.tipOption.getValue())
              .then(() => DataStoreService.firstTime = false)));
      }
    });
  }

  setDefaults(): Promise<void> {
    console.log('entering data-store.service.setDefaults');
    let promise: Promise<void> = null;
    this.service.getItem(PATH_DEFAULTS).snapshotChanges().do(
      obs => {
        promise =
          this.service.copyNode(PATH_DEFAULT_TAX_PERCENT, PATH_SETTINGS_TAX_PERCENT)
            .then(() => {
              this.service.copyNode(PATH_DEFAULT_TIP_PERCENT, PATH_SETTINGS_TIP_PERCENT)
                .then(() => {
                  this.service.copyNode(PATH_DEFAULT_DELIVERY, PATH_SETTINGS_DELIVERY);
                })
                .catch(reason => this.service.logFailure('setDefaults', PATH_SETTINGS_DELIVERY, null, reason));
            })
            .catch(reason => this.service.logFailure('setDefaults', PATH_SETTINGS_TAX_PERCENT, null, reason));
      });
    return promise;
  }

  subscribeAll(): Promise<void> {

    let path = '';
    let promise = null;
    try {
      path = PATH_SETTINGS;
      this._settingsSub = this.service.getItem<Settings>(path).valueChanges()
        .subscribe(this.settings);

      path = PATH_ITEMS;
      this._allItemsSub = this.service.getList(path)
        .valueChanges()
        .subscribe(obs => this.allItems.next(obs));

      path = PATH_ORDERS;
      this._allOrdersSub = this.service.getList<IOrder>(path)
        .valueChanges()
        .subscribe(obs => this.allOrders.next(obs));

      path = PATH_ENUM_CHANGE_OPTIONS;
      this._changeOptionsSub = this.service.getList<ChangeBasis>(path)
        .valueChanges()
        .subscribe(obs => this.changeOptions.next(obs));

      this._changeOptionSub = this.service.db.list<ChangeBasis>(path,
        ref => ref.orderByChild('isDefault').equalTo(true).limitToFirst(1))
        .valueChanges()
        .subscribe(obs => obs.forEach(itm => {
          if (itm.isDefault) {
            this.changeOption.next(itm);
          }
        }));

      path = PATH_DEFAULT_DELIVERY;
      this._deliverySub = this.service.getItem<number>(path)
        .valueChanges()
        .subscribe(obs => this.delivery.next(obs));

      path = PATH_SESSION;
      this._sessionSub = this.service.getItem<Session>(path)
        .valueChanges()
        .subscribe(obs => this.session.next(obs));

      path = PATH_SETTINGS_SHOW_INTRO;
      this._showIntroSub = this.service.getItem<boolean>(path)
        .valueChanges()
        .subscribe(obs => this.showIntro.next(obs));

      path = PATH_SETTINGS_TAX_PERCENT;
      this._taxPercentSub = this.service.getItem<number>(path)
        .valueChanges()
        .subscribe(obs => this.taxPercent.next(obs));

      path = PATH_ENUM_TIP_OPTIONS;
      this._tipOptionsSub = this.service.getList<TipBasis>(path)
        .valueChanges()
        .subscribe(obs => this.tipOptions.next(obs));

      this._tipOptionSub = this.service.db.list<TipBasis>(path,
        ref => ref.orderByChild('isDefault').equalTo(true).limitToFirst(1))
        .valueChanges()
        .subscribe(obs => obs.forEach(itm => {
          if (itm.isDefault) {
            this.tipOption.next(itm);
          }
        }));

      path = PATH_SETTINGS_TIP_PERCENT;
      this._tipPercentSub = this.service.getItem<number>(path)
        .valueChanges()
        .do(() => promise = new Promise<void>(() => {}))
        .subscribe(obs => this.taxPercent.next(obs));
      return promise;

    } catch (err) {
      this.service.logFailure('subscribeAll', path, null, err);
    }
  }

  ngOnDestroy() {
    this._allItemsSub.unsubscribe();
    this._allOrdersSub.unsubscribe();
    this._changeOptionsSub.unsubscribe();
    this._changeOptionSub.unsubscribe();
    this._deliverySub.unsubscribe();
    this._orderSub.unsubscribe();
    this._sessionSub.unsubscribe();
    this._settingsSub.unsubscribe();
    this._showIntroSub.unsubscribe();
    this._taxPercentSub.unsubscribe();
    this._tipOptionsSub.unsubscribe();
    this._tipOptionSub.unsubscribe();
    this._tipPercentSub.unsubscribe();
  }

  setDefaultTipOption(option: TipBasis): Promise<void> {
    return this.service.set(PATH_SETTINGS_TIP_OPTION, option);
  }

  setDefaultChangeOption(option: ChangeBasis): Promise<void> {
    return this.service.set(PATH_SETTINGS_CHANGE_OPTION, option);
  }

  toggleShowIntro(choice: boolean) {
    this.service.set(PATH_SETTINGS, {showIntro: choice});
  }

  setTaxPercent(value: number) {
    return this.service.set(PATH_SETTINGS, {taxPercent: value});
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

  // Order level queries
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

  // Return items attached to an order,
  // update item.key with the firebase key
  //
  getItems(orderId: string): Observable<Item[]> {
    let result: Observable<Item[]> = null;
    const filter = {orderByChild: 'orderId', equalTo: orderId};
    // return this.service.query(PATH_ITEMS, filter).valueChanges();
    this.service.query(PATH_ITEMS, filter)
      .map(snap => snap.forEach(thing => result = thing.payload.val()));
    return result;
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
    });
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

  // App-level queries

  //
  private patchKey(kvp: { $key, $value }) {
    const result = kvp.$value;
    result['key'] = kvp.$key;
    return result;
  }

}
