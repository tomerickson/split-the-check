import { AfterContentInit, AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Helpers, Session, Settings } from '../model';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/zip'
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-order-totals',
  templateUrl: 'order-totals.component.html',
  styleUrls: ['./order-totals.component.scss']
})

export class OrderTotalsComponent implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {

  @Input() session: Session;
  @Input() settings: Settings;

  tax: number;
  tip: number;
  delivery: number;
  total: number;
  paid: number;
  overShort: number;
  underPaid: boolean;
  subscriptions: Subscription[] = [];
  service: DataStoreService;
  helpers: Helpers;
  subSession: Subscription;
  subSettings: Subscription;

  constructor(svc: DataStoreService, hlp: Helpers) {
    this.service = svc;
    this.helpers = hlp;
  }

  subscribeAll(): Promise<void> {

    const promise = new Promise<void>(() => {});
    // this.subSettings = this.service.settings.subscribe(() => this.settings);
    /*this.session = Observable.zip(this.service.allOrders, this.service.allItems,
      this.service.settings, (ord, itm, settings) =>
        new Session(ord, itm, settings, this.helpers));*/
      /*this.subSettings = this.service.settings.subscribe(() => this.settings);
      const promise: Promise<void> = new Promise(() => {});
    promise.then(() =>
          this.subSession = Observable.zip(this.service.allOrders, this.service.allItems,
            this.service.settings, (ord, itm, settings) => {
              return Observable.of( new Session(ord, itm, settings, this.helpers));
            }).subscribe(obs => this.session);*/
    return promise;
  }

  clearOrder(e: Event) {
    this.service.wrapUp();
    e.preventDefault();
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    this.subSession.unsubscribe();
    this.subSettings.unsubscribe();
  }

  ngAfterContentInit() {
    this.subscribeAll().then(() =>
      console.log('order-totals onInit settings' + JSON.stringify(this.settings)), err => console.log('order-totals failed ' + err.toJSON()));
    // console.log('order-totals.AfterContentInit session: ' + JSON.stringify(this.session.items));
  }

  ngAfterViewInit() {
    // console.log('order-totals.AfterViewInit session: ' + JSON.stringify(this.session.orders));
  }
}
