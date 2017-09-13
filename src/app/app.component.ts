import {Component, OnDestroy, OnInit, Output} from '@angular/core';
import {DataStoreService} from './data-store/data-store.service';
import {Settings} from './model/settings';
import {Subject} from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit, OnDestroy {

  showIntro: boolean;
  service: DataStoreService;
  @Output() settings: BehaviorSubject<Settings>;

  constructor(svc: DataStoreService) {
    this.service = svc;
    this.settings = new BehaviorSubject<Settings>(null);
    this.service.showIntro.subscribe(obs => this.showIntro);
    this.service.settings.subscribe(obs => {
      this.settings.next(obs);
      this.showIntro = this.settings.getValue().showIntro;
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.settings.unsubscribe();
  }
}

