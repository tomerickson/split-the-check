import {Component, OnInit, OnDestroy} from "@angular/core";
import { ChangeBasis, TipBasis} from "./model/";
import {HeaderService} from "./header.service";
import { Observable } from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {
  salesTaxPercent: Observable<number>;
  tipPercent: Observable<number>;
  delivery: Observable<number>;
  changeBases: Observable<ChangeBasis[]>;
  changeBasis: Observable<ChangeBasis>;
  tipBases: Observable<TipBasis[]>;
  tipBasis: Observable<TipBasis>;
  total: number;
  tax: number;
  tip: number;

  showIntro: boolean;

  /* masking for 2-position decimal numbers */
  decimalMask = [/\d/, /\d/, '.', /\d/, /\d/];

  constructor(public service: HeaderService) {
    this.showIntro = true;
  }

  ngOnInit() {
    this.tipBases = this.service.getTipBases();
    this.tipBasis = this.service.tipBasis;
    this.changeBases = this.service.getChangeBases();
    this.changeBasis = this.service.chgBasis;
    this.salesTaxPercent = this.service.taxPercent;
    this.tipPercent = this.service.getTipPercent();
    this.delivery = this.service.delivery;
    this.tax = this.service.tax;
    this.tip = this.service.tip;
    this.total = this.service.total;
    console.info(this.tipBases);
    console.info(this.tipBasis);
    console.info(this.changeBasis);
  }

  ngOnDestroy() {
    this.service.wrapup();
  }

  UpdateTipBasis(newValue) {
    this.service.setTipBasis(newValue);
  }

  UpdateChangeBasis(newValue) {
    this.service.setChangeBasis(newValue);
  }

  UpdateDelivery(newValue) {
    this.service.setDelivery(newValue);
  }

  toggleIntro() {
    this.showIntro = !this.showIntro;
  }
}


