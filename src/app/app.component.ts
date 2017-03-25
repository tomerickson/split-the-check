import {Component, OnInit, OnDestroy} from "@angular/core";
import {Settings, ChangeBasis, TipBasis} from "./model/";
import {HeaderService} from "./header.service";
import {Totals} from "./model/totals";
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {Header} from "./model/header";
import {async} from "rxjs/scheduler/async";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {
  /* data to model */
  settings: Settings = null;
  totals: Totals;
  header: Header;
  //changeBasis: number = .25;
  salesTaxPercent: Observable<number>;
  tipPercent: Observable<number>;
  delivery: Observable<number>;
  changeBases: Observable<ChangeBasis[]>;
  changeBasis: BehaviorSubject<ChangeBasis>;
  tipBases: BehaviorSubject<TipBasis[]>;
  tipBasis: BehaviorSubject<TipBasis>;
  subTotal: Observable<number>;
  total: Observable<number>;
  tax: Observable<number>;
  tip: Observable<number>;
  defaultTip: Subscription;
  defaultChange: Subscription;
  /* masking for 2-position decimal numbers */
  decimalMask = [/\d/, /\d/, '.', /\d/, /\d/];

  constructor(public service: HeaderService) {
    this.header = new Header();
  }

  ngOnInit() {
    this.tipBases = this.service.getTipBases();
    this.tipBasis = this.service.tipBasis;
    this.changeBases = this.service.getChangeBases();
    this.changeBasis = this.service.chgBasis;
    this.salesTaxPercent = this.service.getSalesTaxPercent();
    this.tipPercent = this.service.getTipPercent();
    this.total = this.service.getTotal();
    this.subTotal = this.service.getSubTotal();
    this.delivery = this.service.getDelivery();
    this.tax = this.service.getTax();
    this.tip = this.service.getTip();
    console.log(this.tipBases);
    console.log(this.tipBasis);
    console.log(this.defaultTip);
   // debugger;
  }

  ngOnDestroy() {
    this.defaultTip.unsubscribe();
  }

  UpdateTipBasis(event, newValue) {
    this.service.setTipBasis(newValue);
    console.log('this.tipBasis  = ' + this.tipBasis);
  }

  UpdateChangeBasis(event, newValue) {
    this.service.setChangeBasis(newValue);
    console.log('this.service.changeBasis = ' + this.service.chgBasis);
  }

  UpdateDelivery(event, newValue) {
    this.service.setDelivery(newValue);
  }
}


