import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { Helpers, Session, Settings } from '../model';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';

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

  constructor(svc: DataStoreService, private hlp: Helpers) {
    this.service = svc;
    this.helpers = hlp;
    const promise: Promise<any> = new Promise<any>(() => {
      this.buildComponent();
    });
    promise.then(() => {
    })
      .catch(err => console.log(err.toJSON()))
  }

  buildComponent() {
    this.session = new Session(this.service, this.helpers);
    this.settings = new Settings(this.service);
    console.log('home: buildComponent: ' + isNullOrUndefined(this.session));
  }

  ngOnInit() {
    this.subscriptions.push(this.service.showIntro.subscribe(obs => this.showIntro = obs));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

