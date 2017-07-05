import {Component, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import {DataStoreService} from '../data-store/data-store.service';
import 'rxjs/add/operator/map';
import {Settings} from "../model/settings";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {ChangeBasis} from "../model/change-basis";
import {TipBasis} from "../model/tip-basis";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['settings.component.scss']
})

export class SettingsComponent implements OnInit, OnDestroy, AfterViewInit {

  settings: Settings;
  subSettings: Subscription;
  subTips: Subscription;
  subChanges: Subscription;
  changeOptions: ChangeBasis[];
  tipOptions: TipBasis[];

  constructor(public service: DataStoreService) {
    this.settings = new Settings();
  }

  ngOnInit() {
    this.subSettings = this.service.settings.subscribe(obj => {
      this.settings.salesTaxPercent = obj.taxPercent;
      this.settings.tipPercent = obj.tipPercent;
      this.settings.changeBasis = obj.changeOption;
      this.settings.tipBasis = obj.tipOption;
      this.settings.delivery = obj.delivery;
      this.settings.showIntro = obj.showIntro;
    });
    this.subChanges = this.service.getChangeOptions().subscribe(obj => {
      this.changeOptions = obj.valueOf();
      });
    this.subTips = this.service.getTipOptions().subscribe(obj => {
      this.tipOptions = obj.valueOf();
    })
  }

  ngOnDestroy() {
    this.subSettings.unsubscribe();
    this.subChanges.unsubscribe();
    this.subTips.unsubscribe();
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
