import { ChangeDetectionStrategy, Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import 'rxjs/add/operator/map';
import { Settings } from '../model/settings';
import { ChangeBasis } from '../model/change-basis';
import { TipBasis } from '../model/tip-basis';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDefault } from '../model/IDefault';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
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
  changeBasis: ChangeBasis;
  tipBasis: TipBasis;

  setTaxPercent = (event) => {
    this.taxPercent = event.currentTarget.value;
  }
  setTipPercent = (event) => {
    this.tipPercent = event.currentTarget.value;
  }
  setDelivery = (event) => {
    this.delivery = event.currentTarget.value;
  }

  constructor(public service: DataStoreService, @Inject(FormBuilder) builder: FormBuilder) {
    this.fb = builder;
    this.buildForm();
  }

  set taxPercent(value) {
  }

  set tipPercent(value) {
  }

  set delivery(value) {
  }

//#endregion

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
        .filter(opt => opt.value === this.settings.changeOption.value)[0];
    }
  }

  setTipBasis() {
    if (this.settings && this.tipOptions) {
      this.tipBasis = this.tipOptions
        .filter(opt => opt.value === this.settings.tipOption.value)[0];
    }
  }

  selectedOption(a: IDefault, b: IDefault) {
    return a.value === b.value;
  }
}
