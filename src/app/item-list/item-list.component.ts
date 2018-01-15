/**
 * Created by Erick on 2/6/2017.
 */
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Item, Order } from '../model';
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-item-list-outlet',
  templateUrl: 'item-list.component.html',
  styleUrls: ['item-list.component.scss']
})

export class ItemListComponent implements OnInit, OnDestroy {
  @Input() orderId: string;
  @Input() order: Order;
  items: Item[] = [];
  itemSubscription: Subscription;
  listData: GenericData<Item>;
  listDataSource: GenericDataSource<Item>;
  filterFunction = (item: Item) => {
    return;
  };

  fillItemList(list: Item[]) {
    this.order.items = [];
    list.map(itm => this.order.items.push(itm));
    this.listData.data = this.order.items;
  }

  constructor(public service: DataStoreService) {
  }

  ngOnInit() {
    this.listData = new GenericData<Item>([]);
    this.listDataSource = new GenericDataSource<Item>(this.listData, this.filterFunction, false);
//    this.listData = new GenericData<Item>(this.order.items);
//    this.listDataSource = new GenericDataSource<Item>(this.listData, this.filterFunction, false);
    this.itemSubscription = this.service.getItems(this.orderId)
      .subscribe(list => this.fillItemList(list));
  }

  ngOnDestroy() {
    this.itemSubscription.unsubscribe();
  }

  removeItem(item) {
    // debugger;
  }
}

/**
 * Generic Datasource implementation for CDK tables
 */
export class GenericData<T> {

  private _data: BehaviorSubject<T[]>;

  constructor(members: T[]) {
    this._data = new BehaviorSubject<T[]>([]);
  }

  set data(value: T[]) {
    this._data.next(value);
  }
  get data(): T[] {
    return this._data.value;
  }
}

/**
 * filterFunction and caseSensitive properties
 * are required before calling connect()
 */
export class GenericDataSource<T> extends DataSource<any> {

  private _filterChange: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(private _database: GenericData<T>,
              private filterFunction: Function,
              private caseSensitive: boolean = false) {
    super();
  }

  get filter(): string {
    return this._filterChange.value;
  }

  set filter(filter: string) {
    this._filterChange.next(filter);
  }

  connect(): Observable<T[]> {
    const displayDataChanges = [
      this._database.data,
      this._filterChange];

    return Observable.merge(...displayDataChanges).map(() => {
      return this._database.data.slice().filter((item: T) => {
        let searchStr = (this.filterFunction(item));
        let thisFilter = this.filter;
        if (this.caseSensitive) {
          searchStr = searchStr.toLowerCase();
          thisFilter = thisFilter.toLowerCase();
        }
        return searchStr.indexOf(thisFilter) !== -1;
      });
    });
  }

  disconnect() {
  }
}

/** An example database that the data source uses to retrieve data for the table. */
export class ItemDatabase {
  /** Stream that emits whenever the data has been modified. */
  private dataChange: BehaviorSubject<Item[]>;

  constructor(order: Order) {
    // Fill up the database with 100 users.
    this.dataChange = new BehaviorSubject<Item[]>(order.items);
  }

  get data(): Item[] {
    return this.dataChange.value;
  }
}

/**
 * Data source to provide what data should be rendered in the table. Note that the data source
 * can retrieve its data in any way. In this case, the data source is provided a reference
 * to a common data base, ExampleDatabase. It is not the data source's responsibility to manage
 * the underlying data. Instead, it only needs to take the data and send the table exactly what
 * should be rendered.
 */
export class ItemDataSource extends DataSource<any> {
  _filterChange = '';

  constructor(private _exampleDatabase: ItemDatabase) {
    super();
  }

  get filter(): string {
    return '';
  }

  set filter(filter: string) {
    this._filterChange = '';
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Item[]> {
    const displayDataChanges = [
      this._exampleDatabase.data,
      this._filterChange,
    ];

    return Observable.merge(...displayDataChanges).map(() => {
      return this._exampleDatabase.data.slice().filter((item: Item) => {
        const searchStr = ('').toLowerCase();
        return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
      });
    });
  }

  disconnect() {
  }
}
