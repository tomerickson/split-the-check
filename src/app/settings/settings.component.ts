import {Component, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import {DataStoreService} from '../data-store/data-store.service';
import {TipBasis} from "../model/tip-basis";
import {Observable} from "rxjs/Observable";
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['settings.component.scss']
})

export class SettingsComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(public service: DataStoreService) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
  }

  updateChangeBasis(event) {
    this.service.setChangeBasis(event.currentTarget.selectedIndex);
  }

  updateTipBasis(event) {
    this.service.setTipBasis(event.currentTarget.selectedIndex);
  }

  setDelivery(event: Event) {

  }
}
