import { AfterContentInit, Component, Inject, OnDestroy } from '@angular/core';
import { DataStoreService } from './data-store/data-store.service';
import { BehaviorSubject } from 'rxjs';
import { DataProviderService } from './data-provider/data-provider.service';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';
import { FirebaseObjectObservable } from 'angularfire2/database-deprecated';
import { AngularFireObject } from 'angularfire2/database';

@Component( {
  selector: 'app-test',
  template: `<h3>This is the test component</h3>
  <h3>Tax Percent: {{taxPercent | async}}</h3>`
})

export class TestComponent implements AfterContentInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  private taxPercentSub: Subscription;

  taxPercent: Observable<number>;

  constructor (public service: DataProviderService) {

    this.taxPercent = this.service.getObject<number>('/settings/taxPercent').valueChanges();
  }

  ngAfterContentInit() {
  }

  ngOnDestroy() {
    this.taxPercentSub.unsubscribe();
    this.subscriptions.forEach((sub => sub.unsubscribe()));
  }
}
