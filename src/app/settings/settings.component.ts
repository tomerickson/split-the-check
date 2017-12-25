import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeBasis, TipBasis, Settings } from '../model';
import { MatRadioChange } from '@angular/material';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['settings.component.scss']
})

export class SettingsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() settings: Settings;
  fb: FormBuilder;
  activity: Object;
  changeForm: FormGroup;
  taxPercent: number;
  tipPercent: number;
  delivery: number;
  showIntro: boolean;
  tipBasis: TipBasis;
  changeBasis: ChangeBasis;
  tipOptions: TipBasis[];
  changeOptions: ChangeBasis[];
  subscriptions: Subscription[] = [];

  constructor(public service: DataStoreService, builder: FormBuilder) {
    this.fb = builder;
  }

  ngOnInit() {
    this.subscriptions.push(this.settings.taxPercent.subscribe((obs) => this.taxPercent = obs));
    this.subscriptions.push(this.settings.tipPercent.subscribe((obs) => this.tipPercent = obs));
    this.subscriptions.push(this.settings.delivery.subscribe((obs) => this.delivery = obs));
    this.subscriptions.push(this.settings.showIntro.subscribe((obs) => this.showIntro = obs));
    this.subscriptions.push(this.settings.tipOption.subscribe((obs) => this.tipBasis = obs));
    this.subscriptions.push(this.settings.changeOption.subscribe((obs) => this.changeBasis = obs));
    this.subscriptions.push(this.service.tipOptions.subscribe((obs) => this.tipOptions = obs));
    this.subscriptions.push(this.service.changeOptions.subscribe((obs) => this.changeOptions = obs));
    this.buildForm();
  }

  buildForm() {

    this.changeForm = this.fb.group({
      taxPercent: [this.taxPercent, [Validators.required, Validators.pattern('\d+(\.\d+)')]],
      tipPercent: [this.tipPercent, Validators.required],
      delivery: [this.delivery, Validators.required],
      changeBasis: [this.changeBasis, Validators.required],
      tipBasis: [this.tipBasis, Validators.required]
    }, {updateOn: 'change'});
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges) {

    for (const propName in changes) {
      console.log('ngOnChanges.propName:' +  propName);
      if (changes.hasOwnProperty(propName)) {

        const change = changes[propName];
        this.activity = propName;
        if (propName === 'tipOptions' && change.currentValue !== change.previousValue) {
          // this.tipOptions.sort((a, b) => a.value - b.value);
          this.settings.setTipOption(change.currentValue);
        }

        if (propName === 'changeOptions' && change.currentValue !== change.previousValue) {
          // this.changeOptions.sort((a, b) => a.value - b.value);
          this.settings.setChangeOption(change.currentValue);
        }

        if (propName === 'taxPercent' && change.currentValue !== change.previousValue) {
          this.settings.setTaxPercent(change.currentValue);
        }

        if (propName === 'tipPercent' && change.currentValue !== change.previousValue) {
          this.settings.setTipPercent(change.currentValue);

        }
        if (propName === 'delivery' && change.currentValue !== change.previousValue) {
          this.settings.setDelivery(change.currentValue);
        }
      }
    }
  }

  selectedTipOption(opt: TipBasis) {
  }

  selectedChangeOption(opt: ChangeBasis) {
  }

  clicking(value: any) {
    console.log('clicking');
  }


  handleTipBasisClick(event: MatRadioChange) {
    const basis: TipBasis = Object.assign({}, event.value);
  }

  handleChangeBasisClick(event: MatRadioChange) {
    const basis: ChangeBasis = Object.assign({}, event.value);
  }
}
