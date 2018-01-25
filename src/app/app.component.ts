import { Component, OnDestroy, OnInit} from '@angular/core';
import {DataStoreService} from './data-store/data-store.service';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit, OnDestroy {

  show: boolean;
  subIntro: Subscription;
  service: DataStoreService;
  // @Output() settings: BehaviorSubject<Settings>;

  constructor(svc: DataStoreService) {
    this.service = svc;
    this.subIntro = this.service.showIntro.subscribe((show) => this.show = show);
  }

  ngOnInit() {
    // this.router.navigate(['/home'])
  }

  ngOnDestroy() {
    this.subIntro.unsubscribe();
  }

  toggleIntro(value: boolean) {

    this.service.setShowIntro(value).then(
      () => console.log('exiting app.toggleIntro with value: ' + value),
      err => console.error('app.toggleIntro failed with ' + err.toJSON()));

  }
}

