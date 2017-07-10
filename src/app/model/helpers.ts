/*
* Commonly used re-entrant methods.
*/
import {Item} from './item';
import {TipBasis} from './tip-basis';

export class Helpers {

  static tallyPurchaseValue(items: Item[]): number {
    let amt = 0;
    items.forEach(item => {
      amt += item.price * item.quantity;
    });
    return amt;
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
}

