import {Component, OnInit, OnDestroy} from '@angular/core';
import {HeaderService} from "../header.service";

@Component({
  selector: 'order-totals',
  templateUrl: 'order-totals.component.html',
  styleUrls: ['./order-totals.component.scss']
})

export class OrderTotalsComponent implements OnInit, OnDestroy {

  constructor(public service: HeaderService) {
    console.log(this.service);
  }

  ngOnInit() {
   // this.service.getTotals().subscribe(data => this.totals = data);

  }

  ngOnDestroy() {

  }

}
