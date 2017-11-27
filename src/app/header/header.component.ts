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

  constructor(public service: DataStoreService) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {;
  }

  toggleIntro(value) {
    this.service.toggleShowIntro(value);
    console.log('exiting header.toggleIntro');
  }
}
