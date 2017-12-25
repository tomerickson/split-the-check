/*
* Commonly used re-entrant methods.
*/
import { TipBasis } from './tip-basis';
import 'rxjs/add/operator/defaultIfEmpty';
import { IItem } from './IItem';
import { Observable } from 'rxjs/Observable';
import { ChangeBasis } from './change-basis';
import { Session } from './session';
import { Subscription } from 'rxjs/Subscription';
import { Settings } from './settings';

export class Helpers {

  /**
   * Calculate total of merchandise
   *
   * @param {IItem[]} items
   * @param {boolean} numeric?
   * @returns {number}
   */
  static subtotal(items: IItem[], numeric?: boolean): number ;
  /**
   *
   * @param {Observable<IItem[]>} items
   * @returns {Observable<number>}
   */
  static subtotal(items: Observable<IItem[]>): Observable<number> ;
  /**
   *
   * @param {IItem[] | Observable<IItem[]>} items
   * @param {boolean} numeric
   * @returns {number | Observable<number>}
   */
  static subtotal(items: IItem[] | Observable<IItem[]>, numeric?: boolean): number | Observable<number> {
    if (numeric) {
      const itms = <IItem[]>items;
      return itms.map(item => item.price * item.quantity).reduce((sum, vlu) => sum + vlu, 0);
    } else {
      const itms = <Observable<IItem[]>>items;
      return itms.map(element => element.map(item => item.price * item.quantity)
        .reduce((sum, vlu) => sum + vlu, 0));
    }
  }

  /**
   * Calculate tax
   *
   * @param {number} subtotal
   * @param {Observable<Settings>} settings
   * @returns {number}
   */
  /*static tax(subtotal: number, settings: Observable<Settings>): number ;
  static tax(subtotal: Observable<number>,
             settings: Observable<Settings>): Observable<number>;
  static tax(subtotal: number | Observable<number>,
             settings: Observable<Settings>) {
    if (typeof subtotal === 'number') {
      return subtotal * Helpers.unwrap(settings).taxPercent / 100;
    } else {
      const sub: Observable<number> = subtotal as Observable<number>;
      return Observable.combineLatest(sub, service.taxPercent, ((amt, pct) => amt * pct / 100));
    }
  }*/

  /**
   * Calculate tip
   *
   * @param {number} subtotal
   * @param {number | Observable<number>} taxAmount
   * @param {Settings} settings
   * @returns {number | Observable<number>}
   */
  static tip(subtotal: number,
             taxAmount: number,
             settings: Settings): number;

  static tip(subtotal: Observable<number>,
             taxAmount: Observable<number>,
             settings: Settings): Observable<number>;

  static tip(subtotal: number | Observable<number>,
             taxAmount: number | Observable<number>,
             settings: Settings): number | Observable<number> {
    const basis: TipBasis = Helpers.unwrap(settings.tipOption);
    if (typeof subtotal === 'number') {
      let result = 0;
      const tax: number = taxAmount as number;
      const pct: number = Helpers.unwrap(settings.tipPercent);
      if (basis.description === 'Gross') {
        result = (subtotal + tax) * pct / 100;
      } else {
        result = result = subtotal * pct / 100;
      }
      return result;
    } else {
      const amt: Observable<number> = subtotal as Observable<number>;
      return Observable.combineLatest(amt, settings.taxPercent, settings.tipPercent, ((a, t, p) =>
        (a + (basis.description === 'Gross' ? t : 0)) * p / 100));
    }
  }

  static delivery(thisTotal: number, settings: Settings, session: Session): number;

  static delivery(thisTotal: Observable<number>, settings: Settings, session: Session): Observable<number>;

  static delivery(thisTotal: number | Observable<number>, settings: Settings, session: Session): number | Observable<number> {
    if (typeof thisTotal === 'number') {
      return Helpers.calcDelivery(thisTotal, settings, session);
    } else {
      let amt = 0;
      const subscription: Subscription = thisTotal.subscribe(total => amt = total);
      const result = Observable.of(Helpers.calcDelivery(amt, settings, session));
      subscription.unsubscribe();
      return result;
    }
  }

  private static unwrap(observable: Observable<any>): any {
    let result: any;
    const subscription = observable.subscribe(obs => result = obs);
    subscription.unsubscribe();
    return result;
  }

  private static calcDelivery(subtotal: number, settings: Settings, session: Session): number {
    let result = 0;
    Observable.combineLatest(session.subtotal, settings.delivery, ((total, delivery) => {
      result = (total > 0 && delivery > 0) ? delivery * (subtotal / total) : 0;
    }));
    return result;
  }
}

