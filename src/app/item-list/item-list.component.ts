/**
 * Created by Erick on 2/6/2017.
 */
import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Item} from '../model/item';
import {DataStoreService} from '../data-store/data-store.service';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-item-list-outlet',
  templateUrl: 'item-list.component.html',
  styleUrls: ['item-list.component.scss']
})

export class ItemListComponent implements OnInit, OnDestroy {
  @Input() orderId: string;
  items: Item[] = [];
  itemSubscription: Subscription;

  constructor(public service: DataStoreService) {

  }

  ngOnInit() {
    this.itemSubscription = this.service.getItems(this.orderId)
      .subscribe(outer => {
        this.items = [];
        outer.map(inner => {
          const itm = Object.assign({}, inner);
        itm.key = inner.$key;
        this.items.push(itm);
      })});
  }

  ngOnDestroy() {
    this.itemSubscription.unsubscribe();
  }
}
