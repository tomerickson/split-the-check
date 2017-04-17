import {Component, OnInit, OnDestroy} from '@angular/core';
import {HeaderService} from "../header.service";
import {Header} from "../model/header";

@Component({
  selector: 'order-totals',
  templateUrl: 'order-totals.component.html',
  styleUrls: ['./order-totals.component.scss']
})

export class OrderTotalsComponent implements OnInit, OnDestroy {

  service: HeaderService;
  constructor(service: HeaderService) {
    this.service = service;
    console.log(this.service);
  }

  ngOnInit() {
  }

  ngOnDestroy() {

  }

  get count() {
    return this.service.orders.getValue().length;
  }

  get subtotal() {
    return this.service.subtotal.getValue();
  }

  get tax() {
    return this.service.tax;
  }

  get tip() {
    return this.service.tip;
  }

  get delivery() {
    return this.service.delivery;
  }

  get total() {
    return this.service.total;
  }

  get paid() {
    return this.service.paid;
  }

  get overShort() {
    return this.service.overShort;
  }

  clearOrder(e: Event) {
    this.service.wrapup();
    e.preventDefault();
  }

}
