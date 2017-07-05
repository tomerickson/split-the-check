import {Component, OnInit, OnDestroy} from '@angular/core';
import {Session} from "../model/session";
import {Settings} from "../model/settings";
import {Order} from "../model/order";
import {Item} from "../model/item";
import "rxjs/add/operator/map";
import "rxjs/add/operator/count";
import "rxjs/add/observable/of"
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/zip"
import {DataStoreService} from "../data-store/data-store.service";

@Component({
  selector: 'order-totals',
  templateUrl: 'order-totals.component.html',
  styleUrls: ['./order-totals.component.scss']
})

export class OrderTotalsComponent implements OnInit, OnDestroy {

  orders: Order[];
  items: Item[];
  session: Observable<Session>;
  settings: Settings;
  service: DataStoreService;

  constructor(service: DataStoreService) {
    this.session = Observable.of(new Session(service));
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  clearOrder(e: Event) {
    this.service.wrapup();
    e.preventDefault();
  }
}
