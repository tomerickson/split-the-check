import { Component, Inject, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
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

  fb: FormBuilder;
  changeForm: FormGroup;
  settings: Settings;
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
    console.log('entering settings.constructor');
    this.fb = builder;
    this.settings = new Settings(service);
  }

  ngOnInit() {
    /*this.subscriptions.push(this.service.taxPercent.subscribe(() => this.taxPercent));
    this.subscriptions.push(this.service.tipPercent.subscribe(() => this.tipPercent));
    this.subscriptions.push(this.service.delivery.subscribe(() => this.delivery));
    this.subscriptions.push(this.service.showIntro.subscribe((obs) => this.showIntro = obs));
    this.subscriptions.push(this.service.tipOption.subscribe(() => this.tipBasis));
    this.subscriptions.push(this.service.changeOption.subscribe(() => this.changeBasis));
    this.subscriptions.push(this.service.tipOptions.subscribe(() => this.tipOptions));
    this.subscriptions.push(this.service.changeOptions.subscribe(() => this.changeOptions));*/
    this.buildForm();
  }

  buildForm() {

    this.changeForm = this.fb.group({
      taxPercent: [this.settings.taxPercent, Validators.required],
      tipPercent: [this.settings.tipPercent, Validators.required],
      delivery: [this.settings.delivery, Validators.required],
      tipBasis: [this.settings.tipOption, Validators.required],
      changeBasis: [this.settings.changeOption, Validators.required],
      changeOptions: [this.service.changeOptions],
      tipOptions: [this.service.tipOptions]
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        const change = changes[propName];
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
