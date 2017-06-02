import {Directive, HostListener, ElementRef, Input} from "@angular/core";
import { MyCurrencyPipe } from "./custom-currency.pipe";

@Directive(
  { selector: "[myCurrencyFormatter]"}
  )

export class MyCurrencyFormatterDirective {

  private el: HTMLInputElement;

  @Input() decimals: number = 2;

  constructor(
    private elementRef: ElementRef,
    private currencyPipe: MyCurrencyPipe
  ) {
    //this.el = this.elementRef.nativeElement;
  }

  @HostListener("focus", ["$event.target"])
  onFocus(target) {
    target.value = this.currencyPipe.parse(target.value, this.decimals); // opposite of transform
    target.select();
  }

  @HostListener("focusout", ["$event.target"])
  onFocusOut(target) {
    target.value = this.currencyPipe.transform(target.value, this.decimals);
  }

}
