import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Session} from "../model/session";
import {Settings} from "../model/settings";
import {Order} from "../model/order";
import {Item} from "../model/item";
import "rxjs/add/operator/map";
import "rxjs/add/operator/count";
import "rxjs/add/observable/of"
import "rxjs/add/observable/zip"
import {DataStoreService} from "../data-store/data-store.service";
import {Subject} from "rxjs/Subject";

@Component({
  selector: 'order-totals',
  templateUrl: 'order-totals.component.html',
  styleUrls: ['./order-totals.component.scss']
})

export class OrderTotalsComponent {

  session: Session;
  service: DataStoreService;

  constructor(svc: DataStoreService) {
    this.service = svc;
    // this.settings = new Subject<Settings>();
    // this.service.settings.subscribe(this.settings);
    this.session = new Session(this.service);
  }

  clearOrder(e: Event) {
    this.service.wrapup();
    e.preventDefault();
  }
}
