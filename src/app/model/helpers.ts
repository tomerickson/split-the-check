/*
* Commonly used re-entrant methods.
*/
import {Item} from './item';
import {TipBasis} from './tip-basis';
import 'rxjs/add/operator/defaultIfEmpty';
import {isNullOrUndefined} from 'util';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { IItem } from './IItem';
import { Observable } from 'rxjs/Observable';
import { ChangeBasis } from './change-basis';

export class Helpers {

  static calculateTip(subtotal: number, basis: TipBasis, tax: number, pct: number): number {
    let amt = subtotal;
    if (basis.description === 'Gross') {
      amt += tax;
    }
    return amt * pct / 100;
  }

  static calculateDelivery(grandTotal: number, thisTotal: number, deliveryTotal: number): number {
    if (deliveryTotal > 0) {
      return deliveryTotal * (thisTotal / grandTotal);
    } else {
      return 0;
    }
  }

  static calculateOverShort(total, paid, changeBasis: ChangeBasis) {
    return Math.round((total - paid) / changeBasis.value) * changeBasis.value;
  }

  static defaultToZero(expression): number {
    return (!expression) ? 0 : expression;
  }

  static setDefault(property, defaultValue): number {
    return (isNullOrUndefined(property)) ? defaultValue : property;
  }
}

