/*
* Commonly used re-entrant methods.
*/
import { TipBasis } from './tip-basis';
import 'rxjs/add/operator/defaultIfEmpty';
import { IItem } from './IItem';
import { Observable } from 'rxjs/Observable';
import { Settings } from './settings';
import { ChangeBasis } from './change-basis';
import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { DataStoreService } from '../data-store/data-store.service';

@Injectable()

export class Helpers implements OnDestroy {

  private subscriptions: Subscription[] = [];
  private service: DataStoreService;
  private settings: Settings;

  constructor(svc: DataStoreService) {
    this.service = svc;
    this.subscriptions.push(this.service.settings.subscribe(obs => this.settings = obs));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  /**
   * Subtotals
   * @param {IItem[]} items
   * @returns {number}
   */
  public subtotal(items: IItem[]): number {
    return items.map(item => item.price * item.quantity).reduce((sum, vlu) => sum + vlu, 0);
  }

  /**
   * Calculate tax
   *
   * @param {number} subtotal
   * @returns {number}
   */
  public tax(subtotal: number): number {
    return subtotal * this.settings.taxPercent / 100;
  }

  /**
   * Calculate tip
   *
   * @param {number} subtotal
   * @param {number} taxAmount
   * @returns {number}
   */
  public tip(subtotal: number,
             taxAmount: number): number {
    let result = 0;
    if (this.settings.tipOption.description === 'Gross') {
      result = (subtotal + taxAmount) * this.settings.tipPercent / 100;
    } else {
      result = subtotal * this.settings.tipPercent / 100;
    }
    return result;
  }

  /**
   * Calculate delivery
   *
   * @param {number} thisTotal
   * @param {number} sessionTotal
\   * @returns {number}
   */
  public delivery(thisTotal: number, sessionTotal: number): number {
    return this.calcDelivery(thisTotal, sessionTotal, this.settings.delivery);
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
  public total(subtotal: number, tax: number, tip: number, delivery: number): number {
    return subtotal + tax + tip + delivery;
  }

  /**
   * Difference between total and paid, optionally rounded
   * to the denomination specified
   * @param {number} total
   * @param {number} paid
   * @param {boolean?} round
   * @returns {number}
   */
  public overShort(total: number, paid: number, round?: boolean) {
    let result = total - paid;
    if (round) {
      result = result / this.settings.changeOption.value * this.settings.changeOption.value;
    }
    return result;
  }

  public unwrap(observable: Observable<any>): any {
    let result: any;
    const subscription = observable.subscribe(obs => result = obs);
    subscription.unsubscribe();
    return result;
  }

  private calcDelivery(subtotal: number, sessionTotal: number, delivery: number): number {
    let result = 0;
    if (delivery > 0 && sessionTotal > 0) {
      result = delivery * (subtotal / sessionTotal);
    }
    return result;
  }
}

