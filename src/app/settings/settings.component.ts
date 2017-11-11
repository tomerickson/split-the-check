import { ChangeDetectionStrategy, Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import 'rxjs/add/operator/map';
import { Settings } from '../model/settings';
import { ChangeBasis } from '../model/change-basis';
import { TipBasis } from '../model/tip-basis';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDefault } from '../model/IDefault';
import { MatRadioChange } from '@angular/material';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['settings.component.scss']
})

export class SettingsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() settings: Settings;
  @Input() tipOptions: TipBasis[];
  @Input() changeOptions: ChangeBasis[];

  fb: FormBuilder;
  changeForm: FormGroup;

  _taxPercent = -1;
  _tipPercent = -1;
  _delivery = -1;
  _tipBasis: TipBasis = null;
  _changeBasis: ChangeBasis = null;

  setDelivery = (event) => {
    this.delivery = event.currentTarget.value;
  }

  constructor(public service: DataStoreService, @Inject(FormBuilder) builder: FormBuilder) {
    console.log('entering settings.constructor');
    this.fb = builder;
    this.buildForm();
  }

  get taxPercent(): number {
    return this._taxPercent;
  }
  set taxPercent(value: number) {
    if (this._taxPercent > -1) {this.service.setTaxPercent(value); }
    this._taxPercent = value;
  }

  get tipPercent(): number {
    return this._tipPercent;
  }

  set tipPercent(value: number) {
    if (this._tipPercent > -1) {this.service.setTipPercent(value); }
    this._tipPercent = value;
  }

  get delivery(): number {
    return this._delivery;
  }

  set delivery(value: number) {
    if (this._delivery > -1) {this.service.setDelivery(value); }
    this._delivery = value;
  }

  get tipBasis(): TipBasis {
    return this._tipBasis;
  }

  set tipBasis(value: TipBasis) {
    if (this._tipBasis !== null) {
      this.service.setTipBasis(value);
    }
    this._tipBasis = value;
  }

  get changeBasis(): ChangeBasis {
    return this._changeBasis;
  }

  set changeBasis(value: ChangeBasis) {
    if (this._changeBasis !== null) {
      this.service.setChangeBasis(value);
    }
    this._changeBasis = value;
  }

  updateSettings() {
    this.service.setSettings(this.settings);
  }

  ngOnInit() {
  }

  buildForm() {
    this.changeForm = this.fb.group({
      taxPercent: [(this.settings) ? this.settings.taxPercent : null, Validators.required],
      tipPercent: [(this.settings) ? this.settings.tipPercent : null, Validators.required],
      delivery: [(this.settings) ? this.settings.delivery.toFixed(2) : null, Validators.required],
      tipBasis: [(this.settings) ? this.settings.tipOption : null, Validators.required],
      changeBasis: [(this.settings) ? this.settings.changeOption : null, Validators.required]
    });
    console.log(JSON.stringify(this.settings));
  }

  ngOnDestroy() {
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        const change = changes[propName];
        if (propName === 'tipOptions' && change.currentValue !== change.previousValue) {
          this.tipOptions.sort((a, b) => a.value - b.value);
          this.setTipBasis();
        }

        if (propName === 'changeOptions' && change.currentValue !== change.previousValue) {
          this.changeOptions.sort((a, b) => a.value - b.value);
          this.setChangeBasis();
        }

        if (propName === 'settings' && change.currentValue !== change.previousValue) {
          this.setTipBasis();
          this.setChangeBasis();
          this.changeForm.setValue({
            taxPercent: this.settings.taxPercent,
            tipPercent: this.settings.tipPercent,
            delivery: this.settings.delivery,
            tipBasis: this.settings.tipOption,
            changeBasis: this.settings.changeOption
          });
        }
      }
    }
  }

  setChangeBasis() {
    if (this.settings && this.changeOptions) {
      this.changeBasis = this.changeOptions
        .filter(opt => opt.value === this.settings.changeOption.value)
        .reduce((nothing, result) => result, null);
    }
  }

  setTipBasis() {
    if (this.settings && this.tipOptions) {
      this.tipBasis = this.tipOptions
        .filter(opt => opt.value === this.settings.tipOption.value)
        .reduce((nothing, result) => result, null);
    }
  }

  selectedTipOption(opt: TipBasis) {
    return JSON.stringify(opt) === JSON.stringify(this.tipBasis);
  }

  selectedChangeOption(opt: ChangeBasis) {
    return JSON.stringify(opt) === JSON.stringify(this.changeBasis);
  }

  clicking(value: any) {
    console.log('clicking');
  }

  handleTipBasisClick(event: MatRadioChange) {
    const basis: TipBasis = Object.assign({}, event.value);
    this.tipBasis = basis;
  }
  handleChangeBasisClick(event: MatRadioChange) {
    const basis: ChangeBasis = Object.assign({}, event.value);
    this.changeBasis = basis;
  }
}
