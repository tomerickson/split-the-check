/**
 * Created by Erick on 3/10/2017.
 */
import {Directive, ElementRef, OnDestroy, Renderer2} from "@angular/core";

@Directive({selector: "[appSelectOnFocus]"})

export class SelectOnFocusDirective implements OnDestroy {
  private mouseUp;
  private focus;
  mouseUpFunction: Function;
  focusFunction: Function;

  constructor(private el: ElementRef, renderer: Renderer2) {

    this.mouseUp = function () {
      el.nativeElement.stopPropagation();
    };
    this.focus = function () {
      console.log("focused");
      el.nativeElement.select();
    };
    this.mouseUpFunction = renderer.listen(el.nativeElement, "mouseup", (event) => this.mouseUp);
    this.focusFunction = renderer.listen(el.nativeElement, "focus", (event) => this.focus);
  }

  ngOnDestroy() {
    this.mouseUpFunction();
    this.focusFunction();
  }
}
