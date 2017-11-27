import { Component, Inject, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeBasis, TipBasis } from '../model';
import { MatRadioChange } from '@angular/material';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['settings.component.scss']
})

export class SettingsComponent implements OnInit, OnDestroy, OnChanges {

  fb: FormBuilder;
  changeForm: FormGroup;

  constructor(public service: DataStoreService, @Inject(FormBuilder) builder: FormBuilder) {
    console.log('entering settings.constructor');
    this.fb = builder;
  }

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    this.changeForm = this.fb.group({
      taxPercent: [this.service.taxPercent.getValue(), Validators.required],
      tipPercent: [(this.service) ? this.service.tipPercent.getValue() : null, Validators.required],
      delivery: [(this.service) ? this.service.delivery : null, Validators.required],
      tipBasis: [(this.service) ? this.service.tipOption : null, Validators.required],
      changeBasis: [(this.service) ? this.service.changeOption : null, Validators.required]
    });
  }

  ngOnDestroy() {
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        const change = changes[propName];
        if (propName === 'tipOptions' && change.currentValue !== change.previousValue) {
          // this.tipOptions.sort((a, b) => a.value - b.value);
          this.service.setTipBasis(change.currentValue);
        }

        if (propName === 'changeOptions' && change.currentValue !== change.previousValue) {
          // this.changeOptions.sort((a, b) => a.value - b.value);
          this.service.setChangeBasis(change.currentValue);
        }

        if (propName === 'taxPercent' && change.currentValue !== change.previousValue) {
          this.service.setTaxPercent(change.currentValue);
        }

        if (propName === 'tipPercent' && change.currentValue !== change.previousValue) {
          this.service.setTipPercent(change.currentValue);

        }
        if (propName === 'delivery' && change.currentValue !== change.previousValue) {
          this.service.setDelivery(change.currentValue);
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
