/*
* Commonly used re-entrant methods.
*/
import {Item} from './item';
import {TipBasis} from './tip-basis';
import 'rxjs/add/operator/defaultIfEmpty';
import {isNullOrUndefined} from 'util';

export class Helpers {

  static tallyPurchaseValue(items: Item[]): number {
    const result: number = items.map(item => {
      const qty = Helpers.setDefault(item.quantity,0);
      const price = Helpers.setDefault(item.price, 0);
      return qty * price;
    })
      .reduce((amt, value) => amt + value, 0);
    return (result) ? result : 0;
    }

  static calculateTip(subtotal: number, basis: TipBasis, tax: number, pct: number): number {
    let amt = subtotal;
    if (basis.description === 'Gross') {
      amt += tax;
    }
    return amt * pct / 100;
  }

  static defaultToZero(expression) {
    return (!expression) ? 0 : expression;
  }

  static setDefault(property, defaultValue) {
    return (isNullOrUndefined(property)) ? defaultValue : property;
  }
}

