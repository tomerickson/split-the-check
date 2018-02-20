/*
* Commonly used re-entrant methods.
*/
import 'rxjs/add/operator/defaultIfEmpty';
import { ItemBase } from './itembase';
import { Observable } from 'rxjs/Observable';
import { Settings } from './settings';
import { Injectable } from '@angular/core';


@Injectable()

export class Helpers {

  /**
   * Subtotals
   * @param {ItemBase[]} items
   * @returns {number}
   */
  public static subtotal(items: ItemBase[]): number {
    if (items && items.length) {
      return items.map(item => (item.price || 0) * (item.quantity || 0))
        .reduce((sum, vlu) => sum + vlu, 0);
    }
    return 0;
  }

  /**
   * Calculate tax
   *
   * @param {number} subtotal
   * @param {Settings} settings
   * @returns {number}
   */
  public static tax(subtotal: number, settings: Settings): number {
    return subtotal * settings.taxPercent / 100;
  }

  /**
   * Calculate tip
   *
   * @param {number} subtotal
   * @param {number} taxAmount
   * @param {Settings} settings
   * @returns {number}
   */
  public static tip(subtotal: number,
             taxAmount: number,
             settings: Settings): number {
    let result = 0;
    if (settings.tipOption.description === 'Gross') {
      result = (subtotal + taxAmount) * settings.tipPercent / 100;
    } else {
      result = subtotal * settings.tipPercent / 100;
    }
    return result;
  }

  /**
   * Calculate delivery
   *
   * @param {number} thisTotal
   * @param {number} sessionTotal
   * @param {Settings} settings
\   * @returns {number}
   */
  public static delivery(thisTotal: number, sessionTotal: number, settings: Settings): number {
    return Helpers.calcDelivery(thisTotal, sessionTotal, settings.delivery);
  }

  /**?
   * Total of merchandise, tax, tip and delivery
   *
   * @param {number} subtotal
   * @param {number} tax
   * @param {number} tip
   * @param {number} delivery
   * @returns {number}
   */
  public static total(subtotal: number, tax: number, tip: number, delivery: number): number {
    return subtotal + tax + tip + delivery;
  }

  /**
   * Difference between total and paid, optionally rounded
   * to the denomination specified
   * @param {number} total
   * @param {number} paid
   * @param {Settings} settings
   * @param {boolean?} round
   * @returns {number}
   */
  public static overShort(total: number, paid: number, settings: Settings, round?: boolean) {
    let result = total - paid;
    if (round) {
      result = Math.round(result / settings.changeOption.value) * settings.changeOption.value;
    }
    return result;
  }


  static calcDelivery(subtotal: number, sessionTotal: number, delivery: number): number {
    let result = 0;
    if (delivery > 0 && sessionTotal > 0) {
      result = delivery * (subtotal / sessionTotal);
    }
    return result;
  }

  static unwrap(observable: Observable<any>): any {
    let result: any;
    const subscription = observable.subscribe(obs => result = obs);
    subscription.unsubscribe();
    return result;
  }
}
