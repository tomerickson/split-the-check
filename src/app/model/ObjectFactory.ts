import { TipBasis } from './tip-basis';
import { ChangeBasis } from './change-basis';

export class ObjectFactory {

  static CreateTipBasisFromJSON(obj: any): TipBasis {
    const tipBasis = new TipBasis();
    Object.assign(tipBasis, obj);
    return tipBasis;
  }

  static CreateChangeBasisFromJSON(obj: any): ChangeBasis {
    const changeBasis = new ChangeBasis();
    Object.assign(changeBasis, obj);
    return changeBasis;
  }
}
