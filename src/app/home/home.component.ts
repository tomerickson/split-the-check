import { ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { ChangeBasis, Helpers, ItemType, Order, Session, Settings, TipBasis } from '../model';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

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
  subtotal = 0;
  items: ItemType[];
  orders: Order[] = [];
  tipOptions: TipBasis[];
  changeOptions: ChangeBasis[];
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
  }

  subscribeAll(): Promise<void> {

    return new Promise<void>(() => {
        this.subscriptions.push(this.service.showIntro.subscribe(obs => this.showIntro = obs));
        this.subscriptions.push(this.service.tipOptions.subscribe(obs => this.tipOptions = obs));
        this.subscriptions.push(this.service.changeOptions.subscribe(obs => this.changeOptions = obs));
        this.subscriptions.push(this.service.settings.subscribe(obs => this.settings = obs));
        this.subscriptions.push(this.service.allItems.subscribe(obs => {
            this.items = obs;
            this.subtotal = 0;
            this.items.map(item =>
                this.subtotal += item.price * item.quantity);
        }));
        this.subscriptions.push(this.service.allOrders.subscribe(obs => this.orders = obs));
    });
  }

  ngOnInit() {
    this.subscribeAll()
      .then(() => console.log('home subscribeAll succeeded.'), err => console.log(`home subscribeAll err: ${err}`));
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

