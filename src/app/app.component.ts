import {Component, OnInit, OnDestroy} from "@angular/core";
import {ChangeBasis, TipBasis} from "./model/";
import {Observable} from "rxjs";
import {DataStoreService} from "./data-store/data-store.service";

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
  total: Observable<number>;
  tax: Observable<number>;
  tip: Observable<number>;

  showIntro: boolean;

  /* masking for 2-position decimal numbers */
  decimalMask = [/\d/, /\d/, '.', /\d/, /\d/];

  constructor(public service: DataStoreService) {
    this.showIntro = true;
  }

  ngOnInit() {
    this.tipBases = this.service.getTipOptions();
    this.tipBasis = this.service.DefaultTipOption;
    this.changeBases = this.service.getChangeOptions();
    this.changeBasis = this.service.DefaultChangeOption;
    this.salesTaxPercent = this.service.getTaxPercent();
    this.tipPercent = this.service.getTipPercent();
    this.delivery = this.service.getDelivery();
    this.tax = this.service.getTaxAmount();
    this.tip = this.service.getTipAmount();
    this.total = this.service.getTotal();
    console.info(this.tipBases);
    console.info(this.tipBasis);
    console.info(this.changeBasis);
  }

  ngOnDestroy() {
    // this.service.wrapup();
  }

  UpdateTipBasis(newValue) {
    // this.service.setTipBasis(newValue);
  }

  UpdateChangeBasis(newValue) {
    // this.service.setChangeBasis(newValue);
  }

  UpdateDelivery(newValue) {
    // this.service.setDelivery(newValue);
  }

  toggleIntro() {
    this.showIntro = !this.showIntro;
  }
}


