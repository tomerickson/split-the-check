import { AfterContentInit, AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Session, Settings } from '../model';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/zip'
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';


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

  constructor(svc: DataStoreService) {
    this.service = svc;
  }

  clearOrder(e: Event) {
    this.service.wrapUp();
    e.preventDefault();
  }

  ngOnInit() {
    console.log('order-totals onInit settings' + JSON.stringify(this.settings));
    console.log('order-totals onInit session ' + JSON.stringify(this.session.items));
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
