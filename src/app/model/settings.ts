import {Observable} from "rxjs";
/**
 * Created by Erick on 2/27/2017.
 */

export class Settings {
  public salesTaxPercent: Observable<number>;
  public tipPercent: Observable<number>;
  public changeBasis: Observable<number>;
  public tipBasis: Observable<number>;
  public delivery: Observable<number>;
  }
