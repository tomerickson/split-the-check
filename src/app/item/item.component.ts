import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChange,
  SimpleChanges
} from '@angular/core';
import { Item } from '../model';
import { DataStoreService } from '../data-store/data-store.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import 'rxjs/add/operator/map';
import { DialogsService } from '../dialogs/dialogs.service';

@Component({
  selector: 'app-item-outlet',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})

export class ItemComponent implements OnChanges {
  @Input() item: Item;
  @Input() index: number;
  @Output() focusIt: EventEmitter<any>;
  @Output() addTrigger: EventEmitter<string>;
  @Output() removeTrigger: EventEmitter<string>;

  public itemForm: FormGroup;
  public quantityPattern = '^[0-9]+$';
  public pricePattern = `^[0-9]+$|^[0-9]+\\.[0-9]{0,3}$`;
  public result: any;

  private fb: FormBuilder;
  private ref: ChangeDetectorRef;

  constructor(private service: DataStoreService,
              private formBuilder: FormBuilder,
              public dialog: DialogsService,
              private detector: ChangeDetectorRef) {
    this.fb = this.formBuilder;
    this.ref = detector;
    this.addTrigger = new EventEmitter<string>();
    this.removeTrigger = new EventEmitter<string>();
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
            const price = isNaN(this.item.price) ? 0 : +this.item.price;
            this.itemForm.setValue({
              description: this.item.description || '',
              quantity: this.item.quantity || 0,
              price: price.toFixed(2),
              instructions: this.item.instructions || ''
            });
            break;
          }
        }
      }
    }
  }

  public openDialog() {
    const message = 'This action cannot be undone.<br>Are you sure you want to do this?';
    this.dialog
      .confirm('Remove this item?', message)
      .subscribe(res => {
        if (res === true) {
          this.removeTrigger.next(this.item.key);
        }
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
    if (this.item.price === 0
      && this.item.description === ''
      && this.item.quantity === 0
      && this.item.instructions === '') {
      this.service.removeItem(this.item.key);
    } else {
      this.itemForm.patchValue(this.item);
    }
  }

  onAdd() {
    console.log('item.onAdd()');
   // this.addTrigger.emit(this.item.orderId);
    this.addTrigger.next(this.item.orderId);
  }

  onSave() {
    if (this.itemForm.valid && this.itemForm.dirty) {
      Object.assign(this.item, this.itemForm.value);
      this.service.updateItem(this.item)
        .then(() => {}, err => console.error(JSON.stringify(this.item)));
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
