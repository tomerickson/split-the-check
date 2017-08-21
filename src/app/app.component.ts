import {Component, OnDestroy, OnInit, Output} from '@angular/core';
import {DataStoreService} from './data-store/data-store.service';
import {Settings} from './model/settings';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit, OnDestroy {
  service: DataStoreService;
  showIntro: boolean;
  @Output() settings: Subject<Settings>;

  constructor(svc: DataStoreService) {
    this.service = svc;
    this.settings = new Subject<Settings>();
    this.service.settings.subscribe(this.settings);
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.settings.unsubscribe();
  }

  toggleIntro() {
    this.showIntro = !this.showIntro;
    this.service.toggleShowIntro(this.showIntro);
  }
}

