import { ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { ChangeBasis, Helpers, ItemBase, Order, OrderBase, Session, Settings, TipBasis } from '../model';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {
  service: DataStoreService;
  @Input() showIntro: boolean;
  session: BehaviorSubject<Session>;
  settings: Settings;
  tipOptions: BehaviorSubject<TipBasis[]>;
  changeOptions: BehaviorSubject<ChangeBasis[]>;
  orders: BehaviorSubject<Order[]>;
  items: BehaviorSubject<ItemBase[]>;
  subSession: Subscription;
  subSettings: Subscription;
  subChangeOptions: Subscription;
  subTipOptions: Subscription;
  subOrders: Subscription;
  subItems: Subscription;
  zone: NgZone;
  ref: ChangeDetectorRef;
  subscriptions: Subscription[] = [];
  private helpers: Helpers;

  constructor(private zn: NgZone,
              private rf: ChangeDetectorRef,
              private svc: DataStoreService,
              private hlp: Helpers) {
    this.service = svc;
    this.helpers = hlp;
    this.zone = zn;
    this.ref = rf;
    this.session = new BehaviorSubject<Session>(null);
    this.changeOptions = new BehaviorSubject<ChangeBasis[]>(null);
    this.tipOptions = new BehaviorSubject<TipBasis[]>(null);
    this.orders = new BehaviorSubject<Order[]>([]);
    this.items = new BehaviorSubject<ItemBase[]>([]);
    this.subSettings = new Subscription();
    this.subSession = new Subscription();
    this.subOrders = new Subscription();
    this.subItems = new Subscription();
    this.settings = this.service.settings;
  }

  subscribeAll() {

    const promise: Promise<any> = new Promise<void>(() => {

      this.subChangeOptions = this.service.changeOptions.subscribe(obs => this.changeOptions.next(obs));
      this.subTipOptions = this.service.tipOptions.subscribe(obs => this.tipOptions.next(obs));
      this.subSession = Observable.zip(
        this.service.allOrders,
        this.service.allItems,
        // this.service.settings,
        (orders, items) => {
          const session = new Session(this.service);
          session.orders = orders || [];
          session.items = items || [];
          session.settings = this.service.settings;
          session.helpers = this.helpers;
          // this.settings = this.service.settings;
          return session;
        })
        .subscribe(session => this.session.next(session));
      this.subOrders = this.service.allOrders.subscribe(obs => this.orders.next(obs));
      this.subItems = this.service.allItems.subscribe(obs => this.items.next(obs));
    });
    promise.catch(err => console.log(`home subscribeAll err: ${err}`));
  }

  ngOnInit() {
    this.subscribeAll();
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.subSettings.unsubscribe();
     this.subSession.unsubscribe();
    this.subChangeOptions.unsubscribe();
    this.subTipOptions.unsubscribe();
    this.subOrders.unsubscribe();
    this.subItems.unsubscribe();
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  reset(event: Event) {
    this.zone.run(() => {
      this.unsubscribeAll();
      this.subscribeAll();
    });
  }
}

