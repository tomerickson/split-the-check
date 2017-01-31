import {Injectable} from "@angular/core";
import "rxjs/Rx";
import {Http} from "@angular/http";
import {Order} from "./model/order";
import {Item} from "./model/item";
import {Header} from "./model/header";
import {TipBasis} from "./model/tip-basis";
import {ChangeBasis} from "./model/change-basis";

@Injectable()

export class OrderService {

  /* Tip Basis dropdown values */
  public tipBases: Array<TipBasis> = [
    {value: 0, description: 'Gross'},
    {value: 1, description: 'Net'}];

  /* Change Basis dropdown values */

  public changeBases: Array<ChangeBasis> = [
    {value: .01, description: 'Penny'},
    {value: .05, description: 'Nickel'},
    {value: .10, description: 'Dime'},
    {value: .25, description: 'Quarter'},
    {value:   1, description: 'Dollar'}];


//  ordersChange = new EventEmitter<Order[]>();

  private header: Header;

  private orders: Order[] = [];

  constructor(private http: Http) {
    this.header = new Header();
  }

  public addOrder(): void {
    this.header.orders.push(new Order());
  }

  public removeOrder(index: number) {
    let orders: Order[] = this.header.orders;
    orders.splice(index, 1);
    this.header.orders = orders;
  }

  public addItem(order: Order) {
    order.items.push(new Item());
  }

  public removeItem(order: Order, index:number) {
    order.items.splice(index,1);
    this.calculateOrder(order);
  }

  public editItem(item: Item) {

  }

  public changeItem(item: Item, priorValue: number) {
    let currentValue = item.price * item.quantity;
    return currentValue - priorValue;
  }

  public getHeader() {
    return this.header;
  }

  public getOrders(): Order[] {
    return this.header.orders;
  }

  public getItems(order: Order) {
    return order.items;
  }

  calculateOrder(order: Order) {
    let orderValue: number = 0;
    for (let item of order.items) {
      orderValue += item.price * item.quantity;
    }
    order.subtotal = orderValue;
    this.calculateTax(order);
    this.calculateTip(order);
    this.summarizeOrders();
    this.calculateDelivery(order);
    this.calculateChange(order);
  }

  calculateTax(order: Order) {
    order.tax = order.subtotal * this.header.salesTaxPercent / 100;
  }

  calculateTip(order: Order) {
    if (this.header.tipBasis === 0){
      order.tip = order.subtotal * this.header.tipPercent;
    } else {
      if (this.header.tipBasis === 1) {
        order.tip = (order.subtotal + order.tax) * this.header.tipPercent;
      }
    }
  }

  calculateChange(order: Order){
    let due = order.subtotal + order.tax + order.tip + order.delivery;
    let overShort = order.paid - due;
    order.overShort = Math.round(overShort/this.header.changeBasis)*this.header.changeBasis;
  }

  summarizeOrders(){
    let subtotal = 0;
    let tax = 0;
    let tip = 0;
    let paid = 0;
    for (let order of this.header.orders){
      subtotal += order.subtotal;
      tax += order.tax;
      tip += order.tip;
      paid += order.paid;
    }
    this.header.subTotal = subtotal;
    this.header.tax = tax;
    this.header.tip = tip;
    this.header.paid = paid;
  }

  calculateDelivery(order: Order){
    if (this.header.subTotal > 0) {
      order.delivery = this.header.delivery * (order.subtotal / this.header.subTotal);
    }
  }
}
