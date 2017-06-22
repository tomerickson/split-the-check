import {Component, OnInit, OnDestroy} from '@angular/core';
import {DataStoreService} from "../data-store/data-store.service";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'order-totals',
  templateUrl: 'order-totals.component.html',
  styleUrls: ['./order-totals.component.scss']
})

export class OrderTotalsComponent implements OnInit, OnDestroy {

  service: DataStoreService;

  constructor(service: DataStoreService) {
    this.service = service;
  }

  ngOnInit() {
    // debugger;
  }

  ngOnDestroy() {

  }

  clearOrder(e: Event) {
    this.service.wrapup();
    e.preventDefault();
  }

}
