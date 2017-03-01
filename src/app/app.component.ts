import {Component, OnInit, OnDestroy, NgZone, ElementRef} from "@angular/core";
import {Settings, ChangeBasis, TipBasis} from "./model/";
import {OrderService} from "./order.service";
import {Totals} from "./model/totals";
import {Observable} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {
  /* data to model */
  settings: Settings = null;
  totals: Totals;
  changeBasis: number = .25;
  changeBases: ChangeBasis[];
  tipBases: TipBasis[];
//  headerSubscription: ISubscription<Header>;
  /* masking for 2-position decimal numbers */
  decimalMask = [/\d/, /\d/, '.', /\d/, /\d/];

  ngOnInit() {
    this.loadSettings();
    //debugger;
    this.loadTipBases();
    this.loadChangeBases();
    this.loadTotals();
    //this.changeBasis = this.settings.ChangeBasis;
  }

  ngOnDestroy() {
  }

  constructor(public service: OrderService, private zone: NgZone) {
  }

  loadTipBases() {
    this.service.getTipBases().subscribe(data => this.tipBases = data);
  }


  loadChangeBases() {
    this.service.getChangeBases().subscribe(data => this.changeBases = data);
  }

  loadTotals() {
    this.service.getTotals().subscribe(data => this.totals = data);
  }

  loadSettings() {
    this.service.getSettings().subscribe(data =>
      this.settings = data);
  }

  UpdateTipBasis(newValue) {
    debugger;
    this.settings.tipBasis = newValue;
    console.log('this.tipBasis  = ' + this.settings.tipBasis);
  }

  UpdateChangeBasis(newValue) {
    debugger;
    this.settings.changeBasis = newValue;
    console.log('ChangeBasis = ' + this.settings.changeBasis);
  }
}


