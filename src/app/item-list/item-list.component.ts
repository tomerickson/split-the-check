/**
 * Created by Erick on 2/6/2017.
 */
import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Item} from '../model/item';
import {DataStoreService} from '../data-store/data-store.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-item-list-outlet',
  templateUrl: 'item-list.component.html',
  styleUrls: ['item-list.component.scss']
})

export class ItemListComponent implements OnInit, OnDestroy {
  @Input() orderId: string;
  items: Item[];
  itemSubscription: Subscription;

  constructor(public service: DataStoreService) {

  }

  ngOnInit() {
    this.itemSubscription = this.service.getItems(this.orderId).subscribe(items => {
      this.items = [];
      items.map(obs => {
        this.items.push(obs);

      })
    });
  }

  ngOnDestroy() {
    this.itemSubscription.unsubscribe();
  }

  addItem() {
    this.service.addItem(this.orderId);
  }

  removeItem(item: Item) {
    this.service.removeItem(item);
  }

  changeItem(item: Item, arg: object) {
    this.service.updateItem(item, arg);
  }
}
