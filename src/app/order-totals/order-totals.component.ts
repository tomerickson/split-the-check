import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Session, Settings, Order, Item, OrderTotals} from '../model';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/zip'
import {DataStoreService} from '../data-store/data-store.service';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-order-totals',
  templateUrl: 'order-totals.component.html',
  styleUrls: ['./order-totals.component.scss']
})

export class OrderTotalsComponent implements OnInit, OnDestroy {

  service: DataStoreService;
  session: Session;
  sessionSub: Subscription;

  constructor(svc: DataStoreService) {
    this.service = svc;
  }

  ngOnInit() {
    this.sessionSub = this.service.session.subscribe(obs => this.session = obs);
  }

  ngOnDestroy() {
    this.sessionSub.unsubscribe();
  }

  clearOrder(e: Event) {
    this.service.wrapUp();
    e.preventDefault();
  }
}
