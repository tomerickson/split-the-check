import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  showIntro: boolean;
  subscriptions: Subscription[] = [];

  constructor(public service: DataStoreService) {
    this.subscriptions.push(this.service.showIntro.subscribe(obs => this.showIntro = obs));
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleIntro(value) {
   this.service.setShowIntro(value);
    console.log('exiting header.toggleIntro with value: ' + value);
  }
}
