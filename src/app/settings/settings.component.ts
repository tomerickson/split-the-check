import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeBasis, TipBasis, Settings, Helpers } from '../model';
import 'rxjs/add/operator/map';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['settings.component.scss']
})

export class SettingsComponent implements OnInit, OnDestroy {

  @Input() settings: Settings;
  fb: FormBuilder;
  changeForm: FormGroup;
  taxPercent: number;
  tipPercent: number;
  delivery: number;
  tipOption: TipBasis;
  changeOption: ChangeBasis;
  tipOptions: TipBasis[];
  changeOptions: ChangeBasis[];
  private subscriptions: Subscription[] = [];
  private helpers: Helpers;
  numberPattern = '^\\d+(\\.\\d+)?$';

  errorMessages: {[key: string]: string} = {
    required: 'Required entry.',
    pattern: 'Numeric required.'
  };

  constructor(public service: DataStoreService, private hlp: Helpers, private builder: FormBuilder) {
    this.fb = builder;
    this.helpers = hlp;
  }

  ngOnInit() {
    this.buildForm();
    this.buildSubscriptionsAndFillForm()
      .then(() => console.log('settings init complete'))
      .catch(err => console.error('settings init failed: ' + err.toJSON()));
  }

  buildSubscriptionsAndFillForm() {
    return new Promise<any>(() => {
      this.subscriptions.push(this.service.settings.subscribe(obs => {
        this.settings = obs;
        this.taxPercent = this.settings.taxPercent;
        this.tipPercent = this.settings.tipPercent;
        this.delivery = this.settings.delivery;
        this.changeOption = this.settings.changeOption;
        this.tipOption = this.settings.tipOption;
        this.changeForm.controls['taxPercent'].setValue(this.taxPercent);
        this.changeForm.controls['tipPercent'].setValue(this.tipPercent);
        this.changeForm.controls['delivery'].setValue(this.delivery);
        this.changeForm.controls['tipOption'].setValue(this.tipOption);
        this.changeForm.controls['changeOption'].setValue(this.changeOption);
      }));
      this.subscriptions.push(this.service.tipOptions.subscribe((obs) => this.tipOptions = obs));
      this.subscriptions.push(this.service.changeOptions.subscribe((obs) => this.changeOptions = obs));
    });
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
  }

  ngOnDestroy() {
    this.clearSubscriptions();
  }

  /**
   * POST the changes back to the /settings node
   * @param formValue
   */
  postIt(formValue) {
    this.service.setSettings(formValue)
      .then(() =>  alert(JSON.stringify(formValue)));
  }

  /**
   * Revert any changes.
   */
  undoIt() {
    this.clearSubscriptions();
    this.changeForm.reset();
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
}
