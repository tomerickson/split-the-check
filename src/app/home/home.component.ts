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
  tipOptions: TipBasis[];
  changeOptions: ChangeBasis[];
  orders: Order[] = [];
  items: BehaviorSubject<ItemBase[]>;
  // subSettings: Subscription;
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
    this.items = new BehaviorSubject<ItemBase[]>([]);
  }

  subscribeAll() {

    const promise: Promise<any> = new Promise<void>(() => {

      this.subscriptions.push(this.service.changeOptions.subscribe(obs => this.changeOptions = obs));
      this.subscriptions.push(this.service.tipOptions.subscribe(obs => this.tipOptions = obs));
      this.subscriptions.push(this.service.settings.subscribe(obs => this.settings = obs));
      this.subscriptions.push(Observable.zip(
        this.service.allOrders,
        this.service.allItems,
        // this.service.settings,
        (orders, items) => {
          const session = new Session(this.service);
          session.orders = orders || [];
          session.items = items || [];
          session.settings = this.settings;
          session.helpers = this.helpers;
          // this.settings = this.service.settings;
          return session;
        })
        .subscribe(session => this.session.next(session)));
      this.subscriptions.push(this.service.allOrders.subscribe(obs => this.orders = obs));
      // this.subscriptions.push(this.subItems = this.service.allItems.subscribe(obs => this.items.next(obs)));
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

