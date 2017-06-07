import {IDefault} from './IDefault';
export class TipBasis implements IDefault {
  value: number;
  description: string;
  isDefault: boolean | false;

  constructor(description: string = null, value: number = 0) {
    this.description = description;
    this.value = value;
  }
}
