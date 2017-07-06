import {TipBasis} from "./tip-basis";
import {ChangeBasis} from "./change-basis";

/**
 * Created by Erick on 2/27/2017.
 */

export class Settings {
  public taxPercent: number;
  public tipPercent: number;
  public changeOption: ChangeBasis;
  public tipOption: TipBasis;
  public delivery: number;
  public showIntro: boolean;

  constructor() {
  }
}
