import { Component, OnDestroy } from '@angular/core';
import { Settings } from '../model/settings';
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';
import { ChangeBasis } from '../model/change-basis';
import { TipBasis } from '../model/tip-basis';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnDestroy {
  service: DataStoreService;
  showIntro: boolean;
  settings: Settings;
  private tipOption: TipBasis;
  private changeOption: ChangeBasis;
  changeOptions: ChangeBasis[];
  tipOptions: TipBasis[];
  settingsSub: Subscription;
  changesSub: Subscription;
  tipsSub: Subscription;

  constructor(svc: DataStoreService) {
    this.service = svc;
    this.buildSettings();
  }

  buildSettings() {
    this.tipsSub = this.service.getTipOptions().subscribe(obs => {
      this.tipOptions = [];
      obs.map((option: TipBasis) => {
          this.tipOptions.push(option);
          if (option.isDefault) {
            this.tipOption = option;
          }
        }
      )
    });
    this.changesSub = this.service.getChangeOptions().subscribe(obs => {
      this.changeOptions = [];
      obs.map((option: ChangeBasis) => {
          this.changeOptions.push(option);
          if (option.isDefault) {
            this.changeOption = option;
            this.service.setDefaultChangeOption(option);
          }
        }
      )
    });
    this.service.setDefaultTipOption(this.tipOption);
    this.service.setDefaultChangeOption(this.changeOption);
    this.settingsSub = this.service.settings.subscribe(obs => this.settings = obs);
  }

  ngOnDestroy() {
    this.settingsSub.unsubscribe();
    this.changesSub.unsubscribe();
    this.tipsSub.unsubscribe();
  }
}

