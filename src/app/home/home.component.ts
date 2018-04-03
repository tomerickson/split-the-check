import { ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { ChangeBasis, Helpers, ItemBase, Session, Settings, TipBasis } from '../model';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
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
  items: BehaviorSubject<ItemBase[]>;
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

  subscribeAll(): Promise<void> {

    return new Promise<void>(() => {
      this.subscriptions.push(this.service.showIntro.subscribe(obs => this.showIntro = obs));
      this.subscriptions.push(this.service.settings.subscribe(obs => this.settings = obs));
      this.subscriptions.push(combineLatest(
        this.service.allOrders,
        this.service.allItems,
        this.service.settings,
        // this.service.settings,
        (orders, items, settings) => {
          return new Session(this.service, settings, orders, items, this.helpers);
        })
        .subscribe(session => this.session = session));
    });
  }

  ngOnInit() {
    this.subscribeAll()
      .then(() => {}, err => console.log(`home subscribeAll err: ${err}`));
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

