import { Component } from '@angular/core';
import {header} from './model/';

export enum TipBasisEnum {
    Gross = 0,
    Net = 1
}
export enum changeBasisEnum {
    Penny = .01,
    Nickel = .05,
    Dime = .10,
    Quarter = .25,
    Dollar = 1
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  header: header;
  tipBases = TipBasisEnum;
  tipValues: any;

  constructor() {
    this.header = new header();
    this.tipValues = Object.keys(this.tipBases).filter(Number);
  }
}
