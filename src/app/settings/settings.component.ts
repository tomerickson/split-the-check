import {
  Component, OnInit, OnDestroy, NgZone, OnChanges, SimpleChanges, ChangeDetectorRef, ApplicationRef,
  AfterViewInit, AfterContentInit, ChangeDetectionStrategy, Inject
} from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import 'rxjs/add/operator/map';
import { Settings } from '../model/settings';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { ChangeBasis } from '../model/change-basis';
import { TipBasis } from '../model/tip-basis';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FirebaseListObservable } from 'angularfire2/database';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { async } from 'rxjs/scheduler/async';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['settings.component.scss']
})

export class SettingsComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {


  private _taxPercent: BehaviorSubject<number>;
  private _tipPercent: BehaviorSubject<number>;
  private _delivery: BehaviorSubject<number>;
  private _changeBasis: BehaviorSubject<ChangeBasis>;
  private _tipBasis: BehaviorSubject<TipBasis>;

  changeForm: FormGroup;

  // changeOptions: Observable<ChangeBasis[]>;
  chg: ChangeDetectorRef;
  settings: Observable<Settings>;
  subSettings: Subscription;
  subTips: Subscription;
  tipOptions: BehaviorSubject<TipBasis[]>;
  taxPctSub: Subscription;
  tipPctSub: Subscription;
  delvrySub: Subscription;
  tipOptSub: Subscription;
  chgOptSub: Subscription;
  setTaxPercent = (event) => {
    this.taxPercent = event.currentTarget.value;
  }
  setTipPercent = (event) => {
    this.tipPercent = event.currentTarget.value;
  }
  setDelivery = (event) => {
    this.delivery = event.currentTarget.value;
  }
  setChangeBasis = (event: Event) => {
    const element: HTMLSelectElement = event.currentTarget as HTMLSelectElement;
    this.changeBasis = this.changeOptions[element.selectedIndex];
  }

  setTipBasis = (event: Event) => {
    const element: HTMLSelectElement = event.currentTarget as HTMLSelectElement;
    const fn: (basis: TipBasis) => void = () => {
      this.service.setTipBasis(this.tipOptions.getValue()[element.selectedIndex]);
    };
    this.zoneRun(fn);
  }

  mapTipOptions = (array: TipBasis[]) => {
    this.tipOptions.next(array);
    this.tipBasis = array.find(opt => opt.isDefault);
  }

  mapChangeOptions = (array: ChangeBasis[]) => {
    // array.sort((a, b) => a.value - b.value);
    // this.changeOptions = array;
    // this.changeBasis = array.find(opt => (opt.isDefault === true));
  }

  constructor(public service: DataStoreService, private ngZone: NgZone, @Inject(FormBuilder) fb: FormBuilder, cd: ChangeDetectorRef) {
    debugger;
    this.chg = cd;
    this.settings = null;
    this._taxPercent = new BehaviorSubject(0);
    this._tipPercent = new BehaviorSubject(0);
    this._delivery = new BehaviorSubject(0);
//    this._changeBasis = new BehaviorSubject(null);
    this._tipBasis = new BehaviorSubject(null);
//    this._changeOptions = new BehaviorSubject([]);
    this.tipOptions = new BehaviorSubject(null);
    // this.service.getChangeOptions().first()
    //   .subscribe(obs => this.mapChangeOptions(obs));
    // this.service.getChangeOption().first().subscribe(obs => this._changeBasis = obs.$value);
   // this.changeOptions = this.service.getChangeOptions().first()
      // .map(array => array.sort((a, b) => a.value < b.value));
    this.buildForm(fb);
  }

  //#region Properties
  get taxPercent() {
    return this._taxPercent.getValue();
  }

  set taxPercent(value) {
    this._taxPercent.next(+value);
  }

  get tipPercent() {
    return this._tipPercent.getValue();
  }

  set tipPercent(value) {
    this._tipPercent.next(+value);
  }

  get delivery() {
    return this._delivery.getValue();
  }

  set delivery(value) {
    this._delivery.next(+value);
  }

  get changeOptions() {
    return this.service.getChangeOptions();
  }

  get changeBasis() {
    // return this._changeBasis;
    return this.service.getChangeOption();
  }

  set changeBasis(value) {
    if (value) {
      this.service.setChangeBasis(value);
    }
  }

  get tipBasis() {
    return this._tipBasis.getValue();
  }

  set tipBasis(value) {
    this._tipBasis.next(value);
    if (value) {
      this.service.setTipBasis(value);
    }
  }
/*
  get changeOptions() {
    return this._changeOptions;
  }

  set changeOptions(value: ChangeBasis[]) {
    this._changeOptions = value;
  }
  */
//#endregion

  ngOnInit() {
    debugger;


    this.subTips = this.service.getTipOptions()
      .subscribe(obs => this.mapTipOptions(obs));



    this.service.getTaxPercent().subscribe(obs => this.taxPercent = obs.$value);
    this.service.getTipPercent().subscribe(obs => this.tipPercent = obs.$value);
    this.service.getDelivery().subscribe(obs => this.delivery = obs.$value);
    this.service.getTipOption().subscribe(obs => this.tipBasis = obs.$value);
    this._taxPercent.subscribe(() => this.service.setTaxPercent(this._taxPercent.getValue()));
    this._tipPercent.subscribe(() => this.service.setTipPercent(this._tipPercent.getValue()));
    this._delivery.subscribe(() => this.service.setDelivery(this._delivery.getValue()));
    // this.taxPctSub = this.service.getTaxPercent().subscribe(obs => this.
    // this.taxPercent = this.service.getTaxPercent();
    // this.taxPctSub = this.service.getTaxPercent().subscribe(pct => this.taxPercent = pct);
    this.subSettings = this.service.settings.subscribe(obj => {
      this.settings = obj;
      // this.changeOption = this.settings.changeOption;
      // this.tipOption = this.settings.tipOption;
    });
  }

  buildForm(fb: FormBuilder) {

    this.changeForm = fb.group({changeBasis: ['', Validators.required]});
  }
  ngAfterViewInit() {
    this.chg.detectChanges();
  }

  ngOnDestroy() {
    this._taxPercent.unsubscribe();
    this._tipPercent.unsubscribe();
    this._delivery.unsubscribe();
    this._tipBasis.unsubscribe();
    this.taxPctSub.unsubscribe();
    this.subSettings.unsubscribe();
    this.subTips.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    /*debugger;
    if (changes['taxPercent']) {
      this.taxPercent = this.service.getTaxPercent();
    }*/
    console.log('changes: ' + JSON.stringify(changes));
  }

  zoneRun(target: Function) {
    this.ngZone.run(() => target);
    this.chg.detectChanges();
  }
}
