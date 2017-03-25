import {Component, OnInit, OnDestroy} from '@angular/core';
import {HeaderService} from "../header.service";
import {Totals} from "../model/totals";

@Component({
  selector: 'order-totals',
  templateUrl: './order-totals.component.html',
  styleUrls: ['./order-totals.component.scss']
})

export class OrderTotalsComponent implements OnInit, OnDestroy {


  totals: Totals;

  constructor(private service: HeaderService) {}

  ngOnInit() {
   // this.service.getTotals().subscribe(data => this.totals = data);

  }

  ngOnDestroy() {

  }

}
