import { ChangeDetectorRef, Component, Inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
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
  changer: ChangeDetectorRef;
  activity: Object;
  changeForm: FormGroup;
  taxPercent: number;
  tipPercent: number;
  delivery: number;
  showIntro: boolean;
  tipOption: TipBasis;
  changeOption: ChangeBasis;
  tipOptions: TipBasis[];
  changeOptions: ChangeBasis[];
  subscriptions: Subscription[] = [];
  numberPattern = '^\\d+(\\.\\d+)?$';

  errorMessages: {[key: string]: string} = {
    required: 'Required entry.',
    pattern: 'Numeric required.'
  };

  constructor(public service: DataStoreService, private builder: FormBuilder, private cd: ChangeDetectorRef) {
    this.fb = builder;
    this.changer = cd;
  }

  ngOnInit() {
    this.buildForm();
    this.buildSubscriptionsAndFillForm();
  }

  buildSubscriptionsAndFillForm() {
    this.subscriptions.push(this.settings.taxPercent.subscribe((obs) => {
      this.taxPercent = obs;
      // this.changeForm.patchValue({taxPercent: this.taxPercent});
      this.changeForm.controls['taxPercent'].setValue(this.taxPercent);
    }));
    this.subscriptions.push(this.settings.tipPercent.subscribe((obs) => {
      this.tipPercent = obs;
      this.changeForm.patchValue({tipPercent: this.tipPercent});
    }));
    this.subscriptions.push(this.settings.delivery.subscribe((obs) => {
      this.delivery = obs;
      this.changeForm.patchValue({delivery: this.delivery});
    }));
    this.subscriptions.push(this.settings.showIntro.subscribe((obs) => {
      this.showIntro = obs;
      this.changeForm.patchValue({showIntro: this.showIntro});
    }));
    this.subscriptions.push(this.settings.tipOption.subscribe((obs) => {
      this.tipOption = obs;
      this.changeForm.patchValue({tipOption: this.tipOption});
    }));
    this.subscriptions.push(this.settings.changeOption.subscribe((obs) => {
      this.changeOption = obs;
      this.changeForm.patchValue({changeOption: this.changeOption});
    }));
    this.subscriptions.push(this.service.tipOptions.subscribe((obs) => this.tipOptions = obs));
    this.subscriptions.push(this.service.changeOptions.subscribe((obs) => this.changeOptions = obs));
  }

  clearSubscriptions() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  buildForm() {

    this.changeForm = this.fb.group({
      taxPercent: [null, [Validators.required, Validators.pattern(this.numberPattern)]],
      tipPercent: [null, [Validators.required, Validators.pattern(this.numberPattern)]],
      delivery: [null, [Validators.required, Validators.pattern(this.numberPattern)]],
      changeOption: [null, Validators.required],
      tipOption: [this.tipOption, Validators.required]
    }, {updateOn: 'change'});
    // this.changeForm.get('taxPercent').valueChanges.forEach((value) => alert('taxpercent: ' + this.changeForm.valid));
  }

  ngOnDestroy() {
    this.clearSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges) {

    /*for (const propName in changes) {
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
    }*/
  }

  /**
   * POST the changes back to the /settings node
   * @param formValue
   */
  postit(formValue) {
    this.service.setSettings(formValue);
    alert(JSON.stringify(formValue));
  }

  /**
   * Revert any changes.
   */
  undoit() {
    this.clearSubscriptions();
    this.buildSubscriptionsAndFillForm();
  }

  /**
   * Convert the numeric string to 2-pos decimal
   *
   * @param {Event} event
   */
  decimalize(event: Event) {
    const control = event.currentTarget as HTMLInputElement;
    const value: any = control.value;
    control.value = (value * 1).toFixed(2);
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
