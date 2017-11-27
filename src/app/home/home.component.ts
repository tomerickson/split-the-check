import { Component, OnDestroy, OnInit } from '@angular/core';
import { Settings } from '../model/settings';
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';
import { ChangeBasis } from '../model/change-basis';
import { TipBasis } from '../model/tip-basis';
import 'rxjs/add/operator/do';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit, OnDestroy {
  service: DataStoreService;

  constructor(svc: DataStoreService) {
    this.service = svc;
  }
  
  ngOnInit() {
  }
  ngOnDestroy() {
  }
}

