import {Component, Input, Output, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {Item} from '../model/item';
import {DataStoreService} from '../data-store/data-store.service';
import {Subscription} from 'rxjs/Subscription';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import 'rxjs/add/operator/map';
import {FirebaseObjectObservable} from 'angularfire2/database';

@Component({
  selector: 'app-item-outlet',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss']
})

export class ItemComponent implements OnInit, OnDestroy {
  @Input() itemId: string;
  @Input() index: number;
  @Input() orderId: string;
  @Output() removeItem = new EventEmitter<number>()

  public item: Item;
  /*
  public quantity: number;
  public description: string;
  public price: number;
  public instructions: string;
  */
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
      index: [this.index + 1],
      description: [this.item.description, [Validators.required]],
      quantity: [this.item.quantity, [Validators.required, Validators.pattern(this.quantityPattern)]],
      price: [this.item.price, [Validators.required, Validators.pattern(this.pricePattern)]],
      instructions: this.item.instructions,
      amount: [this.amount]
    });
  }

  onRemove() {
    this.removeItem.emit(this.index);
  }
  }
