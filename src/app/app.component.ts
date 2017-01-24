import { Component } from '@angular/core';
import { TextMaskModule } from 'angular2-text-mask';
import { header } from './model/';
import { ChangeBasis } from './model/change-basis';
import { TipBasis } from './model/tip-basis';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})

export class AppComponent {
  /* data to model */
  header: header;
  changeBasis: number;
  /* masking for 2-position decimal numbers */
  decimalMask = [/\d/,/\d/,'.',/\d/,/\d/];

  /* Tip Basis dropdown values */
  tipBases: Array<TipBasis> = [{ value: 0, description: 'Gross' },
  { value: 1, description: 'Net' }];

  /* Change Basis dropdown values */
  changeBases: Array<ChangeBasis> = [{ value: .01, description: 'Penny' },
  { value: .05, description: 'Nickel' },
  { value: .10, description: 'Dime' },
  { value: .25, description: 'Quarter' },
  { value: 1, description: 'Dollar' }]
  tipValues: any;

  constructor() {
    this.header = new header();
    this.changeBasis = this.header.changeBasis;
  }

  reCalc(event: any){
    console.log('recalc!' + this.header.changeBasis);
    console.log(event);
  }
}
