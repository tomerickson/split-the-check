import { Directive, HostListener, ElementRef, OnInit } from "@angular/core";
import { MyCurrencyPipe } from "./custom-currency.pipe";

@Directive({ selector: "[myCurrencyFormatter]" })
export class MyCurrencyFormatterDirective implements OnInit {

  private el: HTMLInputElement;

  constructor(
    private elementRef: ElementRef,
    private currencyPipe: MyCurrencyPipe
  ) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit() {
    this.el.value = this.currencyPipe.transform(this.el.value);
  }

  @HostListener("focus", ["$event.target.value"])
  onFocus(value) {
    this.el.value = this.currencyPipe.parse(value); // opposite of transform
  }

  @HostListener("blur", ["$event.target.value"])
  onBlur(value) {
    this.el.value = this.currencyPipe.transform(value);
  }

}