import { AfterContentInit, AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Session } from '../model';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/count';
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/zip'
import {DataStoreService} from '../data-store/data-store.service';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'app-order-totals',
  templateUrl: 'order-totals.component.html',
  styleUrls: ['./order-totals.component.scss']
})

export class OrderTotalsComponent implements OnInit, AfterContentInit, AfterViewInit {

  service: DataStoreService;
  @Input() session: Session;
  sessionSub: Subscription;

  constructor(svc: DataStoreService) {
    this.service = svc;
//     this.sessionSub = this.service.session.subscribe(obj => this.session
    console.log('order-totals constructor session:' + JSON.stringify(this.session));
  }

  clearOrder(e: Event) {
    this.service.wrapUp();
    e.preventDefault();
  }

  ngOnInit() {
  }

  ngAfterContentInit() {
    console.log('order-totals.AfterContentInit session: ' + JSON.stringify(this.session.items));
  }

  ngAfterViewInit() {
    console.log('order-totals.AfterViewInit session: ' + JSON.stringify(this.session.orders));
  }
}
