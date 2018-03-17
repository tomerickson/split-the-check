import { ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { ChangeBasis, Helpers, ItemBase, Order, Session, Settings, TipBasis } from '../model';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {
  @Input() showIntro: boolean;
  service: DataStoreService;
  session: Session;
  settings: Settings;
  tipOptions: TipBasis[];
  changeOptions: ChangeBasis[];
  // orders: Order[] = [];
  items: BehaviorSubject<ItemBase[]>;
  // subSettings: Subscription;
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
    this.items = new BehaviorSubject<ItemBase[]>([]);
  }

  subscribeAll() {

    const promise: Promise<any> = new Promise<void>(() => {
      this.subscriptions.push(this.service.showIntro.subscribe(obs => this.showIntro = obs));
      this.subscriptions.push(this.service.changeOptions.subscribe(obs => this.changeOptions = obs));
      this.subscriptions.push(this.service.tipOptions.subscribe(obs => this.tipOptions = obs));
      this.subscriptions.push(this.service.settings.subscribe(obs => this.settings = obs));
      this.subscriptions.push(Observable.zip(
        this.service.allOrders,
        this.service.allItems,
        this.service.settings,
        // this.service.settings,
        (orders, items, settings) => {
          return new Session(this.service, settings, orders, items, this.helpers);
        })
        .subscribe(session => this.session = session));
      // this.subscriptions.push(this.service.allOrders.subscribe(obs => this.orders = obs));
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

