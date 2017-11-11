import {Component, OnDestroy, OnInit, Output} from '@angular/core';
import {DataStoreService} from './data-store/data-store.service';
import {Settings} from './model/settings';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit, OnDestroy {

  showIntro: Observable<boolean>;
  service: DataStoreService;
  @Output() settings: BehaviorSubject<Settings>;

  constructor(svc: DataStoreService) {
    this.service = svc;
    this.showIntro = this.service.showIntro;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.settings.unsubscribe();
  }
}

