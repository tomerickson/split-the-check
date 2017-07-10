import {Component, Input, Output} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
// import {ValidationService} from './validation.service';

@Component({
  selector: 'app-control-messages',
  template: `
    <div *ngIf="errorMessage !== null">{{errorMessage}}</div>`
})
export class ControlMessagesComponent {
  // errorMessage: string;
  @Input() control: FormControl;

  constructor() {
  }

  get errorMessage() {
    for (const propertyName in this.control.errors) {
      if (this.control.errors.hasOwnProperty(propertyName) && this.control.touched) {
        return this.control.errors[propertyName];
        // return ValidationService.getValidatorErrorMessage(propertyName, this.control.errors[propertyName]);
      }
    }
    return null;
  }
}
