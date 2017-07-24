import {Component, Input, Output, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {Item} from '../model/item';
import {DataStoreService} from '../data-store/data-store.service';
import {Subscription} from 'rxjs/Subscription';
import {AsyncValidator, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import 'rxjs/add/operator/map';
import {FirebaseObjectObservable} from 'angularfire2/database';
import {ValidationService} from '../validation.service';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {async} from 'rxjs/scheduler/async';
import {getValueInRange} from '@ng-bootstrap/ng-bootstrap/util/util';

@Component({
  selector: 'app-item-outlet',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})

export class ItemComponent implements OnInit, OnDestroy {
  @Input() itemId: string;
  @Input() item: Item;
  @Input() index: number;
  @Input() orderId: string;
  @Output() focusit: EventEmitter<any>;
  public amount: number;
  public itemForm: FormGroup;
  public quantityPattern = '^[0-9]+$';
  public pricePattern = `^[0-9]+$|^[0-9]+\\.[0-9]{0,3}$`;
  private priorValue: number;
  private itemSubscription: Subscription;

  constructor(private service: DataStoreService, private formBuilder: FormBuilder) {
    this.priorValue = 0;
    console.log('item.component.ts constructor');
  }

  ngOnInit() {
    console.log('item.key=' + this.item.key);
    /*this.itemSubscription = this.service.getItem(this.itemId).subscribe(fbo => {
      this.item = fbo.$value;
      this.item.key = fbo.$key;
    });*/
    this.createForm();
  }

  ngOnDestroy() {
    this.itemSubscription.unsubscribe();
  }

  createForm() {
   //  const ctlDescription = new FormControl('', Validators.required);
   //  ctlDescription.patchValue(this.item.description);
    this.itemForm = this.formBuilder.group({
      description: [null, Validators.required],
      quantity: [null,  [Validators.required, Validators.pattern(this.quantityPattern)]],
      price: [null,  [Validators.required, Validators.pattern(this.pricePattern)]],
      instructions: null
    });
    this.itemForm.patchValue(this.item);
    console.log('item=' + JSON.stringify(this.item));
    this.itemForm.valueChanges
      .subscribe(data => this.onValueChanged(data))
  }

  onAdd() {
    this.service.addItem(this.orderId);
  }

  onChange(data: any) {
    if (this.itemForm.valid && this.itemForm.dirty) {
      let changed = false;
      changed = changed || this.detectChange('description');
      changed = changed || this.detectChange('price');
      changed = changed || this.detectChange('quantity');
      changed = changed || this.detectChange('instructions');
      if (changed) {
        this.service.updateItem(this.item);
      }
      console.log(JSON.stringify(this.item));
    }
  }

  detectChange(fieldName: string): boolean {
    let changed = false;
    if (this.itemForm.controls[fieldName].valid && this.itemForm.controls[fieldName].dirty) {
      this.item[fieldName] = this.itemForm.value[fieldName];
      changed = true;
    }
    return changed;
  }

  onValueChanged(data?: any) {
    if (!this.itemForm) {
      return;
    }
    if (this.itemForm.dirty && this.itemForm.valid) {
      this.service.updateItem(this.item);
    }
  }

  onRemove() {
    this.service.removeItem(this.item.key);
  }
}
