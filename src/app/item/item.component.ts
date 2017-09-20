import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Item } from '../model/item';
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';

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
    this.createForm();
  }

  ngOnDestroy() {
  }

  createForm() {
    //  const ctlDescription = new FormControl('', Validators.required);
    //  ctlDescription.patchValue(this.item.description);
    this.itemForm = this.formBuilder.group({
      description: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.pattern(this.quantityPattern)]],
      price: [null, [Validators.required, Validators.pattern(this.pricePattern)]],
      instructions: null
    });
    this.itemForm.patchValue(this.item);
    console.log('item=' + JSON.stringify(this.item));
  }

   onUndo() {
    if (this.itemForm.dirty) {
      if (this.item.price === 0 && this.item.description === '' && this.item.quantity === 0 && this.item.instructions === '') {
        this.service.removeItem(this.item.key);
      } else {
        this.itemForm.reset();
      }
    }
  }

  onAdd() {
    this.service.addItem(this.orderId);
  }

  onSave(data: any) {
    if (this.itemForm.valid && this.itemForm.dirty) {
      Object.assign(this.item, this.itemForm.value);
      this.service.updateItem(this.item);
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
