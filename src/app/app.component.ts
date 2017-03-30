import {Component, OnInit, OnDestroy} from "@angular/core";
import {Settings, ChangeBasis, TipBasis} from "./model/";
import {HeaderService} from "./header.service";
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {Header} from "./model/header";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {
  /* data to model */
  settings: Settings = null;
  //totals: Totals;
  header: Header;
  //changeBasis: number = .25;
  salesTaxPercent: Observable<number>;
  tipPercent: Observable<number>;
  delivery: number;
  changeBases: Observable<ChangeBasis[]>;
  changeBasis: Observable<ChangeBasis>;
  tipBases: Observable<TipBasis[]>;
  tipBasis: Observable<TipBasis>;
  total: number;
  tax: number;
  tip: number;
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
    this.salesTaxPercent = this.service.taxPercent;
    this.tipPercent = this.service.getTipPercent();
    this.total = this.service.total;
    this.delivery = this.service.delivery;
    this.tax = this.service.tax;
    this.tip = this.service.tip;
    console.info(this.tipBases);
    console.info(this.tipBasis);
    console.info(this.changeBasis);
  }

  ngOnDestroy() {
    this.defaultTip.unsubscribe();
    this.service.wrapup();
  }

  UpdateTipBasis(newValue) {
    this.service.tipBasis = newValue;
  }

  UpdateChangeBasis(newValue) {
    this.service.changeBasis = newValue;
  }

  UpdateDelivery(newValue) {
    this.service.delivery = newValue;
  }
}


