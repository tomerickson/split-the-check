import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'decimalformat', pure: false})

export class DecimalFormatter implements PipeTransform {
  private PADDING = "000000";

  private DECIMAL_SEPARATOR: string;
  private THOUSANDS_SEPARATOR: string;
  private DECIMAL_PRECISION: number;

  constructor() {
    // TODO: Get from configuration
    //
    this.DECIMAL_SEPARATOR = '.';
    this.THOUSANDS_SEPARATOR = ',';
    this.DECIMAL_PRECISION = 2;
  }

  
   transform(value: number | string, fractionSize: number = this.DECIMAL_PRECISION): string {
    let [ integer, fraction = "" ] = (value || "").toString().split(this.DECIMAL_SEPARATOR);

    fraction = fractionSize > 0
      ? this.DECIMAL_SEPARATOR + (fraction + this.PADDING).substring(0, fractionSize)
      : "";

    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, this.THOUSANDS_SEPARATOR);

    return integer + fraction;
  }

  parse(value: string, fractionSize: number = 2): string {

    let [integer, fraction = ""] = (value || "").split(this.DECIMAL_SEPARATOR);

    integer = integer.replace(new RegExp(this.THOUSANDS_SEPARATOR, "g"), "");

    // Strip off leading zeros
    //
    integer = integer.replace(new RegExp('^[0]+'),"");

    fraction = parseInt(fraction, 10) > 0 && fractionSize > 0
      ? this.DECIMAL_SEPARATOR + (fraction + this.PADDING).substring(0, fractionSize)
      : "";

    return integer + fraction;
  }
}
