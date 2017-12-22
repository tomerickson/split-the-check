import {TipBasis} from './tip-basis';
import {ChangeBasis} from './change-basis';
import { Observable } from 'rxjs/Observable';
import { DataStoreService } from '../data-store/data-store.service';

/**
 * Created by Erick on 2/27/2017.
 */

export class Settings {

  private service: DataStoreService;
  constructor(svc: DataStoreService) {
    this.service = svc;
  }

  get taxPercent(): Observable<number> {
    return this.service.taxPercent;
  }

  setTaxPercent(percent: number) {
    this.service.setTaxPercent(percent);
  }

  get tipPercent(): Observable<number> {
    return this.service.tipPercent;
  }

  setTipPercent(percent: number) {
    this.service.setTipPercent(percent);
  }

  get delivery(): Observable<number> {
    return this.service.delivery;
  }

  setDelivery(delivery: number) {
    this.service.setDelivery(delivery);
  }

  get changeOption(): Observable<ChangeBasis> {
    return this.service.changeOption;
  }

  setChangeOption(option: ChangeBasis) {
    this.service.setChangeBasis(option);
  }

  get tipOption(): Observable<TipBasis> {
    return this.service.tipOption;
  }

  setTipOption(option: TipBasis) {
    this.service.setTipBasis(option);
  }

  get showIntro(): Observable<boolean> {
    return this.service.showIntro;
  }

  setShowIntro(show: boolean) {
    this.service.setShowIntro(show);
  }
}
