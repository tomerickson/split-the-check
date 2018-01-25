import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
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
  service: DataStoreService;
  @Input() showIntro: boolean;
  session: Session;
  settings: Settings;
  private subscriptions: Subscription[] = [];
  private helpers: Helpers;

  constructor(private zone: NgZone, private svc: DataStoreService, private hlp: Helpers) {
    this.service = svc;
    this.helpers = hlp;
  }

  subscribeAll(): Promise<void> {
    // this.subShowIntro = this.service.showIntro.subscribe(show => this.showIntro);
    const promise: Promise<any> = new Promise<void>(() => {
      this.subscriptions.push(this.service.settings.subscribe(obs => this.settings = obs));
      this.buildSession();
    });
    return promise;
  }

  buildSession() {

    this.subscriptions.push(Observable.zip(this.service.allOrders, this.service.allItems,
      this.service.settings, (ord, itm, settings) => {
      const session = new Session();
      session.orders = ord || [];
      session.items = itm || [];
      session.settings = settings;
      session.helpers = this.helpers;
      return session;
      })
      .subscribe(session => this.session = session))
  }

  ngOnInit() {
    this.subscribeAll();
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  reset(event: Event) {
    this.zone.run(() => {
      this.unsubscribeAll();
      this.subscribeAll()
        .then(
          () => console.log('home reset'),
          err => console.error('home reset failed: ' + err.toJSON()));
    });
  }
}

