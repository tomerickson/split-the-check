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

  get count() {
    return this.service.OrderCount;
  }

  get subtotal() {
    return this.service.Subtotal;
  }

  get tax() {
    return this.service.TaxAmount;
  }

  get tip() {
    return this.service.TipAmount;
  }

  get delivery() {
    return this.service.Delivery;
  }

  get total() {
    return this.service.Total;
  }

  get paid() {
    return this.service.Paid;
  }

  get overShort() {
    return Observable.combineLatest(this.total, this.paid,
      (total, paid) => total - paid) as Observable<number>
  }

  clearOrder(e: Event) {
    this.service.wrapup();
    e.preventDefault();
  }

}
