import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChange,
  SimpleChanges
} from '@angular/core';
import { Item, ItemBase } from '../model';
import { DataStoreService } from '../data-store/data-store.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';

import { DialogsService } from '../dialogs/dialogs.service';

@Component({
  selector: 'app-item-outlet',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})

export class ItemComponent implements OnChanges, OnInit, OnDestroy {
  @Input() item: Item;
  @Input() index: number;
  @Output() focusit: EventEmitter<any>;
  public amount: number;
  public itemForm: FormGroup;
  public quantityPattern = '^[0-9]+$';
  public pricePattern = `^[0-9]+$|^[0-9]+\\.[0-9]{0,3}$`;
  public result: any;

  private priorValue: number;
  private fb: FormBuilder;
  private ref: ChangeDetectorRef;

  constructor(private service: DataStoreService,
              private formBuilder: FormBuilder,
              public dialog: DialogsService,
              private detector: ChangeDetectorRef) {
    this.fb = this.formBuilder;
    this.ref = detector;
    this.createForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        const change: SimpleChange = changes[propName];
        // console.log(`item.onchanges change: ${propName} value: ${JSON.stringify(change.currentValue)}`);
        if (change.currentValue === change.previousValue) {
          continue;
        }
        switch (propName) {
          case 'item':
          {
            this.itemForm.setValue({
              description: this.item.description,
              quantity: this.item.quantity || 0,
              price: (+this.item.price).toFixed(2),
              instructions: this.item.instructions || ''
            });
            // this.ref.detectChanges();
            break;
          }
        }
      }
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  public openDialog() {
    const message = 'This action cannot be undone.<br>Are you sure you want to do this?';
    this.dialog
      .confirm('Remove this item?', message)
      .subscribe(res => {
        this.result = res;
        console.log(JSON.stringify(this.result));
      });
  }

  createForm() {
    this.itemForm = this.fb.group({
      description: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.pattern(this.quantityPattern)]],
      price: ['', [Validators.required, Validators.pattern(this.pricePattern)]],
      instructions: ['']
    });
    // this.itemForm.patchValue(this.item);
    // console.log('item=' + JSON.stringify(this.item));
  }

  onUndo() {
    this.itemForm.reset();
    if (this.item.price === 0 && this.item.description === '' && this.item.quantity === 0 && this.item.instructions === '') {
      this.service.removeItem(this.item.key);
    } else {
      this.itemForm.patchValue(this.item);
    }
  }

  onAdd() {
    const item = new ItemBase();
    this.service.addItem(item);
  }

  onSave() {
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
