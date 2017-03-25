/**
 * Created by Erick on 3/12/2017.
 */
import {Order} from "../model/order";
import {Header} from "../model/header";
import {BehaviorSubject} from "rxjs";
import {HeaderService} from "../header.service";

export class HeaderView {
  private service: Header;
  public salesTaxPercent: BehaviorSubject<number>;
  public tipPercent: BehaviorSubject<number>;
  public subTotal: BehaviorSubject<number>;
  public tax: BehaviorSubject<number>;
  public tip: BehaviorSubject<number>;
  public delivery: BehaviorSubject<number>;
  public total: BehaviorSubject<number>;
  public paid: BehaviorSubject<number>;
  public overShort: BehaviorSubject<number>;
  public changeBasis: BehaviorSubject<number>;
  public tipBasis: BehaviorSubject<number>;
  public Orders: BehaviorSubject<Order[]>;

  constructor(service: HeaderService) {
    this.service = new Header();
    this.subTotal = new BehaviorSubject(this.service.subTotal);
    this.tax = new BehaviorSubject(this.service.tax);
    this.tip = new BehaviorSubject(this.service.tip);
    this.delivery = new BehaviorSubject(this.service.delivery);
    this.total = new BehaviorSubject(this.service.total);
    this.paid = new BehaviorSubject(this.service.paid);
    this.changeBasis = service.chgBasis;
    this.tipBasis = service.tipBasis;
    this.Orders = new BehaviorSubject(Order[]);
  }
}
