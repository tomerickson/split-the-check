import { AfterContentInit, AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Session } from '../model';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/zip'
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';


@Component({
  selector: 'app-order-totals',
  templateUrl: 'order-totals.component.html',
  styleUrls: ['./order-totals.component.scss']
})

export class OrderTotalsComponent implements OnInit, AfterContentInit, AfterViewInit, OnDestroy {

  service: DataStoreService;
  @Input() session: Session;
  orders: number;
  subtotal: number;
  tax: number;
  tip: number;
  delivery: number;
  total: number;
  paid: number;
  overShort: number;
  underPaid: boolean;
  subscriptions: Subscription[] = [];

  constructor(svc: DataStoreService) {
    this.service = svc;
  }

//     this.sessionSub = this.service.session.subscribe(obj => this.session}

  clearOrder(e: Event) {
    this.service.wrapUp();
    e.preventDefault();
  }

  ngOnInit() {
    if (isNullOrUndefined(this.session)) {
      debugger;
    }
    this.subscriptions.push(this.session.orders.subscribe(obs => this.orders = obs.length));
    this.subscriptions.push(this.session.subtotal.subscribe(obs => this.subtotal = obs));
    this.subscriptions.push(this.session.tax.subscribe(obs => this.tax = obs));
    this.subscriptions.push(this.session.tip.subscribe(obs => this.tip = obs));
    this.subscriptions.push(this.session.delivery.subscribe(obs => this.delivery = obs));
    this.subscriptions.push(this.session.total.subscribe(obs => this.total = obs));
    this.subscriptions.push(this.session.paid.subscribe(obs => this.paid = obs));
    this.subscriptions.push(this.session.overShort.subscribe(obs => this.overShort = obs));
    this.subscriptions.push(this.session.underPaid.subscribe(obs => this.underPaid = obs));

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngAfterContentInit() {
    // console.log('order-totals.AfterContentInit session: ' + JSON.stringify(this.session.items));
  }

  ngAfterViewInit() {
    // console.log('order-totals.AfterViewInit session: ' + JSON.stringify(this.session.orders));
  }
}
