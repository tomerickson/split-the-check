import {Component, Input} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ValidationService} from '../validation.service';

@Component({
  selector: 'app-control-messages',
  templateUrl: './control-messages.component.html',
  styleUrls: ['./control-messages.component.scss']
})
export class ControlMessagesComponent {
  @Input() control: FormControl;
  @Input() expando: string;

  constructor() {
  }

  get errorMessage() {
    if (typeof(this.control.errors) !== 'undefined') {
      for (const errorName in this.control.errors) {
        if (this.control.touched) {
          return ValidationService.getValidatorErrorMessage(this.expando, errorName, this.control.errors[errorName]);
        }
      }
    }
    return null;
  }
}
