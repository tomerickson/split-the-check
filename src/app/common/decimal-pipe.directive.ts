import { Directive, HostListener, ElementRef, OnInit } from "@angular/core";
//import { CurrencyPipe } from "@angular/common";

@Directive({ selector: "[decimalformatter]" })

export class DecimalFormatter implements OnInit {
  private PADDING = "000000";

  private el: HTMLInputElement;
  private DECIMAL_SEPARATOR: string;
  private THOUSANDS_SEPARATOR: string;
  private DECIMAL_PRECISION: number;

  constructor(private elementRef: ElementRef, private decimalPrecision: number) {
    this.el = this.elementRef.nativeElement;

    // TODO: Get from configuration
    //
    this.DECIMAL_SEPARATOR = '.';
    this.THOUSANDS_SEPARATOR = ',';
    this.DECIMAL_PRECISION = +decimalPrecision.toFixed(0);
  }

  ngOnInit() {
    this.el.value = this.transform(this.el.value);
  }

  @HostListener("focus", ["$event.target.value"])
  onFocus(value) {
    this.el.value = this.parse(value); // opossite of transform
  }

  @HostListener("blur", ["$event.target.value"])
  onBlur(value) {
    this.el.value = this.transform(value);
  } 
  
   transform(value: number | string, fractionSize: number = this.decimalPrecision): string {
     debugger;
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
