import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { ChangeBasis, Helpers, ItemBase, Order, OrderBase, Session, Settings } from '../model';
import 'rxjs/add/operator/defaultIfEmpty';
import { Subscription } from 'rxjs/Subscription';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-order-outlet',
  templateUrl: './order.component.html',
  styleUrls: ['order.component.scss']
})

export class OrderComponent implements OnInit, OnDestroy, OnChanges {

  @Input() orderId: string;
 //  @Input() orderSubject: BehaviorSubject<Order>;
  @Input() index: number;
  @Input() session: Session;
  @Input() settings: Settings;
  @Input() order: Order;
  @Output() removeTrigger: EventEmitter<number> = new EventEmitter();
  @Output() changeTrigger = new EventEmitter();
  @Output() addTrigger = new EventEmitter<string>();

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
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        const change: SimpleChange = changes[propName];
        // console.log(`order OnChanges: propName: ${propName} value: ${JSON.stringify(change.currentValue)}`);
        if (change.currentValue === change.previousValue) {
          continue;
        }
        switch (propName) {
          case 'settings':
            // debugger;
            this.setChangeBasis();
            break;
          case 'order':
            // this.order.items = this.getItems(this.orderId);
            if (this.order) {
              this.getItems(this.order.key);
            }
            this.orderForm.patchValue({
              name: change.currentValue.name,
              paid: change.currentValue.paid.toFixed(2)
            });
            break;
          case 'orderId':
            if (change.currentValue) {
              this.orderId = change.currentValue;
            }
            break;
          default:
            break;
        }
      }
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription => subscription.unsubscribe()));
    this.subscriptions = [];
  }

  getItems(orderId: string) {
    this.subscriptions
      .push(this.service.getItems(orderId)
        .subscribe((obs: ItemBase[]) => this.setItems(obs)));
  }

  setItems(items: ItemBase[]) {
    this.order.items = items;
  }

  setChangeBasis() {
    this.subscriptions.push(this.service.changeOption
        .subscribe(obs => this.changeBasis = obs));
  }

  buildForm() {
    this.orderForm = this.fb.group({
      name: ['', [Validators.required], [], {updateOn: 'change'}],
      paid: ['', [Validators.required, Validators.pattern(this.numberPattern)], [], {updateOn: 'change'}]
    });
  }

  removeOrder() {
    this.service.removeOrder(this.orderId);
    return this.service.getItems(this.orderId);
  }

  updateName(event) {
    this.name = (<HTMLInputElement>event.target).value;
    this.service.updateOrder(this.orderId, {name: this.name, paid: this.paid});
  }

  updatePaid(event) {
    const element = <HTMLInputElement>event.target;
    this.paid = +element.value;
    this.service.updateOrder(this.orderId, {name: this.name, paid: this.paid});
    element.value = this.paid.toFixed(2);
  }

  padIt(event: Event) {
    const element = <HTMLInputElement>event.target;
    try {
      element.value = (+element.value).toFixed(2);
    } catch (err) {
      // ignore this error
    }
  }

  selectIt(event: Event) {
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

  addOrder() {
    this.addTrigger.emit('add');
  }
}
