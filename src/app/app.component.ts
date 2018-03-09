import { Component, OnDestroy, OnInit} from '@angular/core';
import {DataStoreService} from './data-store/data-store.service';
import { Router } from '@angular/router';
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
}

