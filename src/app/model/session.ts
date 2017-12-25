import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { DataStoreService } from '../data-store/data-store.service';
import { IItem } from './iitem';
import { IOrder } from './iorder';
import { Helpers } from './helpers';
import { ChangeBasis } from './change-basis';
import { TipBasis } from './tip-basis';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

export class Session implements OnDestroy {

  public title = 'Split the Check';
  get items() {
    return this.service.allItems;
  }
  public ready: BehaviorSubject<boolean>;

  public service: DataStoreService;
  private subscriptions: Subscription[];
  private tipOptionSubscription: Subscription;

  constructor(private svc: DataStoreService) {
    this.service = svc;
    this.subscriptions = [];
    this.ready = new BehaviorSubject<boolean>(false);
  }

  public get orders(): Observable<IOrder[]> {
    return this.service.allOrders;
  }
  public get subtotal(): Observable<number> {
    return this.service.subtotal;
  }

  public get tax(): Observable<number> {
    return this.service.tax(this.subtotal);
  }

  public get tip(): Observable<number> {
    return this.service.tip(this.subtotal, this.tax);
  }

  public get delivery(): Observable<number> {
    return this.service.deliveryShare(this.subtotal)
  }

  public get total(): Observable<number> {
    return this.service.total(this.subtotal, this.tax, this.tip, this.delivery);
  }

  public get paid(): Observable<number> {
    return this.orders.map(arr => arr.map(ord => ord.paid)
      .reduce((sum, vlu) => sum + vlu, 0));
  }

  public get overShort(): Observable<number> {
    return this.service.overShort(this.total, this.paid);
  }

  public get underPaid(): Observable<boolean> {
    return Observable.combineLatest(this.overShort, Observable.of(0), (over, zero) => over < zero);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.tipOptionSubscription.unsubscribe();
  }
}
