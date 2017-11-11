import { Component, OnDestroy } from '@angular/core';
import { Settings } from '../model/settings';
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';
import { ChangeBasis } from '../model/change-basis';
import { TipBasis } from '../model/tip-basis';
import 'rxjs/add/operator/do';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnDestroy {
  service: DataStoreService;
  showIntro: boolean;
  settings: Settings;
  changeOptions: ChangeBasis[] = [];
  tipOptions: TipBasis[];
  settingsSub: Subscription;
  changesSub: Subscription;
  tipsSub: Subscription;
  private tipOption: TipBasis;
  private changeOption: ChangeBasis;

  constructor(svc: DataStoreService) {
    this.service = svc;
    this.buildSettings();
  }

  buildSettings() {
    this.tipOptions = [];
    try {
      this.tipsSub = this.service.getTipOptions()
        .subscribe((options: TipBasis[]) =>
          options.map((option: TipBasis) => {
            console.log(option);
            this.tipOptions.push(option);
            if (option.isDefault) {
              this.tipOption = Object.assign({}, option);
            }
          }));
    } catch (e) {
      console.error(e);
    }

    try {
      this.changeOptions = [];
      this.changesSub = this.service.getChangeOptions()
        .subscribe((options: ChangeBasis[]) =>
          options.map((option: ChangeBasis) => {
            console.log(option);
            this.changeOptions.push(option);
            if (option.isDefault) {
              this.changeOption = Object.assign({}, option);
            }
          }));
    } catch (e) {
      console.error(e);
    }
    this.settingsSub = this.service.getSettings().subscribe(obs => this.settings = obs);
  }

  ngOnDestroy() {
    this.settingsSub.unsubscribe();
    this.changesSub.unsubscribe();
    this.tipsSub.unsubscribe();
  }
}

