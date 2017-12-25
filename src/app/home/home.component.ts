import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { Session, Settings } from '../model';
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
  subscriptions: Subscription[] = [];

  constructor(svc: DataStoreService) {
    this.service = svc;
    this.session = new Session(this.service);
    this.settings = new Settings(this.service);
  }

  ngOnInit() {
    this.subscriptions.push(this.service.showIntro.subscribe(obs => this.showIntro = obs));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

