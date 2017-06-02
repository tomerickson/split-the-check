/**
 * Created by Erick on 4/19/2017.
 */
import {Component, EventEmitter, forwardRef, HostListener, Input, Output} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

/**
 * This component represents money.
 */
@Component({
  selector: 'decimal-input',
  templateUrl: "./decimal-input.component.html",
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DecimalInput),
    multi: true
  }]
})

export class DecimalInput implements ControlValueAccessor {

  // TODO: Localize the decimal point.
  //
  readonly DECIMAL_POINT: string = ".";

  @Input("decimals") DECIMALS: number = 2;
  @Output("decimal") result = new EventEmitter<string>();

  private validatorRex: RegExp = /^\d*\.\d*$|^\d+$/;
  private parserRex: RegExp = /^(\d*)\.(\d*)$|^(\d+)$/;
  private rawNumber: string;
  private success: boolean;

  formattedNumber: string;
  maxValue: number = 9999999999;

  constructor() {

  }

  onFocus(event: Event) {
    let target: HTMLInputElement = <HTMLInputElement> event.target;
    target.select();
  }

  onChange(event: Event) {
    let target: HTMLInputElement = <HTMLInputElement> event.target;
    this.validateInput(target.value);
  }
  onBlur(event: Event) {
    let target: HTMLInputElement = <HTMLInputElement> event.target;
    this.validateInput(target.value);
  }

  private validateInput(input: string) {
    this.rawNumber = input;
    this.formattedNumber = input;
    this.formattedNumber = this.rawNumber;
    this.success = this.validatorRex.test(this.formattedNumber);
    if (this.success) {
      this.beautifyNumericText(input);
    }
    this.result.emit(this.formattedNumber);
  }
  // If there is no significance to the right
  // of the decimal point return the integer
  // without the decimal, otherwise round the
  // fractional part to DECIMALS and pad it with
  // zeroes so the length equals DECIMALs
  // characters.
  //
  private beautifyNumericText(text: string): boolean {
    let matches: string[];
    let integerPart: string;
    let fractionalPart: string;

    matches = this.parserRex.exec(text);

    // parserRex.exec returns an array length 4.  If there's a decimal point
    // matches[1] will contain the integer portion and matches[2] will
    // contain the fractional part.  If there's no decimal point
    // matches[3] will contain the whole value;

    // No numbers entered, return a null string
    //
    if (matches.length != 4) {
      throw new Error("Unexpected RegExp error. value: " + text + ", expression: " + this.parserRex);
    }

    // Nothing to the right of the decimal?
    //
    if (matches[3] && matches[3].length > 0) {
      integerPart = matches[3];
      fractionalPart = "0";
    }
    else {
      integerPart = matches[1];
      fractionalPart = matches[2];
    }

    // Zero decimals expected
    //
    if (this.DECIMALS == 0) {
      this.formattedNumber = integerPart;
      return true;
    }

    // Handle the fractional part
    //
    let result: number = +fractionalPart / Math.pow(10, fractionalPart.length - this.DECIMALS);
    result = Math.round(result);
    let fractionalString: string = result.toString(10);
    let padding = "0".repeat(this.DECIMALS);
    fractionalString = (fractionalString + padding).substring(0, this.DECIMALS);
    this.formattedNumber = integerPart + this.DECIMAL_POINT + fractionalString;
    return true;
  }


  /*
   //Set touched on blur
   //
   onBlur() {
   this.onTouchedCallback();
   }
   */

  // ControlValueAccessor implementation below
  //
  private propagateChange = (_: any) => {
  };

  //From ControlValueAccessor interface
  writeValue(obj: any) {
    if (obj) {
      this.rawNumber = obj;
      // this will format it with 4 character spacing
      this.beautifyNumericText(this.rawNumber);
    }
  }

  //From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched() {
  };
}
