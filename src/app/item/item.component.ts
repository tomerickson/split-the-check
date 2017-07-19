import {Component, Input, Output, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {Item} from '../model/item';
import {DataStoreService} from '../data-store/data-store.service';
import {Subscription} from 'rxjs/Subscription';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import 'rxjs/add/operator/map';
import {FirebaseObjectObservable} from 'angularfire2/database';
import {ValidationService} from '../validation.service';

@Component({
  selector: 'app-item-outlet',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})

export class ItemComponent implements OnInit, OnDestroy {
  @Input() itemId: string;
  @Input() index: number;
  @Input() orderId: string;

  public item: Item;
  public amount: number;
  public itemForm: FormGroup;
  public quantityPattern = '^[0-9]+$';
  public pricePattern = `^[0-9]+$|^[0-9]+\\.[0-9]{0,3}$`;
  private priorValue: number;
  private itemSubscription: Subscription;

  constructor(private service: DataStoreService, private formBuilder: FormBuilder) {
    this.priorValue = 0;
  }

  ngOnInit() {

    this.itemSubscription = this.service.getItem(this.itemId).subscribe(fbo => {
      this.item = fbo;
      this.item.key = fbo.$key;
    });
    this.createForm();
  }

  ngOnDestroy() {
    this.itemSubscription.unsubscribe();
  }

  createForm() {
    this.itemForm = this.formBuilder.group({
      description: [this.item.description, [Validators.required]],
      quantity: [this.item.quantity, [Validators.required, Validators.pattern(this.quantityPattern)]],
      price: [this.item.price, [Validators.required, Validators.pattern(this.pricePattern)]],
      instructions: this.item.instructions
    });
    /*this.itemForm.valueChanges
      .subscribe(data => this.onValueChanged(data))*/
  }

  /*
  onValueChanged(data?: any) {
    if (!this.itemForm) { return; }
    const form = this.itemForm;

    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);

        if (control && control.dirty && !control.valid) {
          debugger;
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }*/

  onRemove() {
    this.service.removeItem(this.item.key);
  }
}
