import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { Helpers, Session, Settings } from '../model';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {
  showIntro: boolean;
  service: DataStoreService;
  session: Session;
  settings: Settings;
  private subscriptions: Subscription[] = [];
  private helpers: Helpers;

  constructor(private svc: DataStoreService, private hlp: Helpers) {
    this.service = svc;
    this.helpers = hlp;
    new Promise<void>(() => this.buildComponent())
      .then(() => console.log('home constructor succeeded.'))
      .catch(err => console.error(err.toJSON()));
  }

  buildComponent(): Promise<void> {
    return new Promise(() => {
      this.subscriptions.push(
      Observable.zip(this.service.allOrders, this.service.allItems,
        this.service.settings, this.service.showIntro, (ord, itm, settings, show) => {
          this.settings = settings;
          this.session = new Session(ord, itm, settings, this.helpers);
          this.showIntro = show;
        })
        .subscribe());
    })
      .catch(err => console.error('home.component' + ' ' + err.toJSON()))
      .then(() => {});
  }

  ngOnInit() {
    this.buildComponent();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

