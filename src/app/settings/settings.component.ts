import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges, ViewRef
} from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeBasis, TipBasis, Settings, Helpers } from '../model';
import 'rxjs/add/operator/map';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.scss']
})

export class SettingsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() settings: Settings;
  @Input() tipOptions: TipBasis[];
  @Input() changeOptions: ChangeBasis[];
  @Output() pushSettings = new EventEmitter();

  fb: FormBuilder;
  changeForm: FormGroup;
  taxPercent: number;
  tipPercent: number;
  delivery: number;
  tipOption: TipBasis;
  changeOption: ChangeBasis;
  private subscriptions: Subscription[] = [];
  private helpers: Helpers;
  numberPattern = '^\\d+(\\.\\d+)?$';

  errorMessages: { [key: string]: string } = {
    required: 'Required entry.',
    pattern: 'Numeric required.'
  };

  constructor(public service: DataStoreService,
              private hlp: Helpers,
              private builder: FormBuilder) {
    this.fb = builder;
    this.helpers = hlp;
    this.buildForm();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.clearSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        const chng = changes[propName];
        const cur = JSON.stringify(chng.currentValue);
        const prev = JSON.stringify(chng.previousValue);
        // console.log(`header ${propName}: currentValue = ${cur}, previousValue = ${prev}`);
        // debugger;
        switch (propName) {
          case 'tipOptions':
            this.tipOptions = chng.currentValue;
            break;
          case 'changeOptions':
            this.changeOptions = chng.currentValue;
            break;
          case 'settings':
            const set: Settings = chng.currentValue;
            if (set) {
              this.taxPercent = set.taxPercent;
              this.tipPercent = set.tipPercent;
              this.delivery = set.delivery;
              this.changeOption = set.changeOption;
              this.tipOption = set.tipOption;
              this.changeForm.controls['taxPercent'].setValue(this.taxPercent);
              this.changeForm.controls['tipPercent'].setValue(this.tipPercent);
              this.changeForm.controls['delivery'].setValue(this.delivery);
              this.changeForm.controls['tipOption'].setValue(this.tipOption);
              this.changeForm.controls['changeOption'].setValue(this.changeOption);
            }
            break;
        }
      }
    }
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
      changeOption: [this.changeOption, Validators.required],
      tipOption: [this.tipOption, Validators.required]
    }, { updateOn: 'change' });
  }


  /**
   * POST the changes back to the /settings node
   * @param formValue
   */
  postIt(formValue) {
    this.service.setSettings(formValue).then(() =>
      this.pushSettings.emit(true));
  }

  /**
   * Revert any changes.
   */
  undoIt() {
    this.pushSettings.emit();
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
