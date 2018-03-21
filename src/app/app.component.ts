import { Component, OnDestroy, OnInit} from '@angular/core';
import {DataStoreService} from './data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit, OnDestroy {

  show: boolean;
  service: DataStoreService;
  subscriptions: Subscription[] = [];

  constructor(svc: DataStoreService) {
    this.service = svc;
    this.subscriptions.push(this.service.showIntro.subscribe((show) => this.show = show));
  }

  ngOnInit() {
    // this.router.navigate(['/home'])
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  /*
  testit() {

    let hnd = Http

    let url = 'https://www.google.com/finance/historical?q=SPY&startdate=01+01+2018&output=csv';
    let client = new HttpClient(url);
  }*/
}

