import {Component, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import {ChangeBasis, TipBasis} from './model/';
import {Observable} from 'rxjs/observable';
import {DataStoreService} from './data-store/data-store.service';
import {Data} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  salesTaxPercent: Observable<number>;
  tipPercent: Observable<number>;
  delivery: Observable<number>;
  /*
  changeBases: Observable<ChangeBasis[]>;
  changeBasis: Observable<ChangeBasis>;
  tipBases: Observable<TipBasis[]>;
  tipBasis: Observable<TipBasis>;
  */

  showIntro: boolean;

  /* masking for 2-position decimal numbers */
  decimalMask = [/\d/, /\d/, '.', /\d/, /\d/];

  constructor(public service: DataStoreService) {
   // this.tipBasis = new Observable<TipBasis>();
   // this.changeBasis = new Observable<ChangeBasis>();
    this.showIntro = true;
  }

  ngOnInit() {
    this.service.TaxPercent = this.service.DefaultTaxPercent;
    this.service.TipPercent = this.service.DefaultTipPercent;
  }
  ngAfterViewInit() {
    /*
    this.tipBasis = this.service.TipOptions
      .map(options => options.filter(option => option.isDefault)[0]);
    this.changeBasis = this.service.ChangeOptions
      .map(options => options.filter(option => option.isDefault)[0]);
    this.salesTaxPercent = this.service.DefaultTaxPercent;
    this.tipPercent = this.service.DefaultTipPercent;
    this.delivery = this.service.Delivery;
    // Initialize the order summary
    //
    this.tipBasis.subscribe((basis) =>
      this.service.TipBasis = basis);

    this.changeBasis.subscribe((basis) =>
      this.service.ChangeBasis = basis);
    */
  }

  ngOnDestroy() {
    }

  toggleIntro() {
    this.showIntro = !this.showIntro;
  }
}


