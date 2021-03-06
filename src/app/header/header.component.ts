import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy, OnChanges {

  @Output() toggle: EventEmitter<boolean>;
  @Input() showIntro: boolean;
  // subShowIntro: Subscription;
  subscriptions: Subscription[] = [];

  constructor(public service: DataStoreService) {
    this.toggle = new EventEmitter<boolean>(false);
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        const chng = changes[propName];
        const cur = JSON.stringify(chng.currentValue);
        const prev = JSON.stringify(chng.previousValue);
      }
    }
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  toggleIntro(value) {
    this.service.setShowIntro(value);
  }
}
