import {Component, OnInit, OnDestroy} from '@angular/core';
import {ChangeBasis, TipBasis} from './model/';
import {Observable} from 'rxjs/observable';
import {DataStoreService} from './data-store/data-store.service';

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

  showIntro: boolean;

  /* masking for 2-position decimal numbers */
  decimalMask = [/\d/, /\d/, '.', /\d/, /\d/];

  constructor(public service: DataStoreService) {
    this.showIntro = true;
  }

  ngOnInit() {
    this.tipBases = this.service.getTipOptions();
    this.tipBasis = this.tipBases
      .map(options => options.filter(option => option.isDefault)[0]);
    this.changeBases = this.service.getChangeOptions();
    this.changeBasis = this.changeBases
      .map(options => options.filter(option => option.isDefault)[0]);
    this.salesTaxPercent = this.service.DefaultTaxPercent;
    this.tipPercent = this.service.DefaultTipPercent;
    this.delivery = this.service.Delivery;

    // Initialize the order summary
    //
    this.tipBasis.subscribe((basis) =>
      this.service.setTipBasis(basis));

    this.changeBasis.subscribe((basis) =>
      this.service.setChangeBasis(basis));

    this.delivery.subscribe((delivery) =>
      this.service.setDeliveryCharge(delivery));

    this.salesTaxPercent.subscribe((taxPercent) =>
      this.service.setTaxPercent(taxPercent));
  }

  ngOnDestroy() {
  }

  toggleIntro() {
    this.showIntro = !this.showIntro;
  }
}


