import {Directive, HostListener, ElementRef, OnInit, Input} from "@angular/core";
import { MyCurrencyPipe } from "./custom-currency.pipe";

@Directive(
  { selector: "[myCurrencyFormatter]"}
  )

export class MyCurrencyFormatterDirective implements OnInit {

  private el: HTMLInputElement;

  @Input() decimals: number = 2;

  constructor(
    private elementRef: ElementRef,
    private currencyPipe: MyCurrencyPipe
  ) {
    //this.el = this.elementRef.nativeElement;
  }

  ngOnInit() {
    //this.el.value = this.currencyPipe.transform(this.el.value, this.decimals);
  }

  @HostListener("focus", ["$event.target"]) onFocus(target) {
    target.value = this.currencyPipe.parse(target.value, this.decimals); // opposite of transform
    target.select();
  }

  @HostListener("focusout", ["$event.target"])
  onFocusOut(target) {
    target.value = this.currencyPipe.transform(target.value, this.decimals);
  }

}
