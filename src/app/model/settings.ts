import { TipBasis } from './tip-basis';
import { ChangeBasis } from './change-basis';
import { DataStoreService } from '../data-store/data-store.service';
import { Subscription } from 'rxjs/Subscription';
import { OnDestroy } from '@angular/core';

/**
 * Created by Erick on 2/27/2017.
 */

export class Settings implements OnDestroy {

  public service: DataStoreService;
  taxPercent: number;
  tipPercent: number;
  delivery: number;
  changeOption: ChangeBasis;
  tipOption: TipBasis;
  showIntro: boolean;

  private subscriptions: Subscription[] = [];

  constructor(svc: DataStoreService) {
    this.service = svc;
    this.subscriptions.push(this.service.settings.subscribe(obs => {
      this.taxPercent = obs.taxPercent;
      this.tipPercent = obs.tipPercent;
      this.delivery = obs.delivery;
      this.changeOption = obs.changeOption;
      this.showIntro = obs.showIntro;
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
