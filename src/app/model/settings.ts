import {TipBasis} from "./tip-basis";
import {ChangeBasis} from "./change-basis";

/**
 * Created by Erick on 2/27/2017.
 */

export class Settings {
  public salesTaxPercent: number;
  public tipPercent: number;
  public changeBasis: ChangeBasis;
  public tipBasis: TipBasis;
  public delivery: number;
  public showIntro: boolean;

  constructor() {
  }
}
