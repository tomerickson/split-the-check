import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { Session, Settings, ItemBase, Helpers, OrderBase, Order, ChangeBasis, TipBasis } from '../model';
import 'rxjs/add/operator/defaultIfEmpty';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-order-outlet',
  templateUrl: './order.component.html',
  styleUrls: ['order.component.scss']
})

export class OrderComponent implements OnInit, OnDestroy, OnChanges {

  @Input() orderId: string;
  @Input() order: Order;
  @Input() index: number;
  @Input() session: Session;
  @Input() settings: Settings;
  @Output() onRemove = new EventEmitter<Order>();
  @Output() changeTrigger = new EventEmitter();

  builder: FormBuilder;
  orderForm: FormGroup;
  numberPattern = '^\\d+(\\.\\d+)?$';
  name: string;
  paid: number;
  count: number;
  total: number;
  overShort: number;
  positive: boolean;
  helpers: Helpers;
  service: DataStoreService;
  changeBasis: ChangeBasis;
  subscriptions: Subscription[] = [];

  constructor(private svc: DataStoreService, private hlp: Helpers, private fb: FormBuilder) {
    this.service = svc;
    this.helpers = hlp;
    this.builder = fb;
  }

  ngOnChanges(changes: SimpleChanges) {
  }


  ngOnInit() {
    this.buildForm();
    const promise: Promise<number> = new Promise<number>(() =>
      this.subscriptions.push(this.service.getItems(this.orderId)
        .subscribe(obs => {
          this.fillOrder(obs);
        })));
    /*.then(() =>
      this.subscriptions.push(this.service.getItems(this.orderId).subscribe(obs => {
        this.order.items = obs;
      })))*/
    promise
      .then(() => {
        this.subscriptions.push(this.service.changeOption.subscribe(obs => this.changeBasis = obs));
        console.log('order ngOnInit succeeded');
      })
      .catch(err => console.error('order ngOnInit failed with error ' + err));
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription => subscription.unsubscribe()));
  }

  buildForm() {
    this.orderForm = this.fb.group({
      name: [this.order.name, [Validators.required]],
      paid: [this.order.paid, [Validators.required, Validators.pattern(this.numberPattern)]]
    }, { updateOn: 'change' });
}

/*  buildOrder(order) {
    this.order = order;
    this.paid = order.paid;
  }
*/

  fillOrder(items: ItemBase[]) {
    if (!items) {
      this.order.items = [];
    }
    this.order.items = items;
  }

  removeOrder() {
    this.service.removeOrder(this.orderId);
    return this.service.getItems(this.orderId);
  }

  updateName(event) {
    this.name = (<HTMLInputElement>event.target).value;
    this.service.updateOrder(this.orderId, { name: this.name, paid: this.paid });
  }

  updatePaid(event) {
    this.paid = +(<HTMLInputElement>event.target).value;
    this.service.updateOrder(this.orderId, { name: this.name, paid: this.paid });
  }

  selectPaid(event: Event) {
    const element = <HTMLInputElement>event.target;
    /*const paid: number = +element.value;
    element.value = paid.toFixed(2);*/
    element.select();
  }

  addItem() {
    const item = new ItemBase();
    item.orderId = this.orderId;
    this.service.addItem(item);
  }
}
