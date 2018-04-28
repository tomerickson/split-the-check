import {Injectable} from '@angular/core';
import {isNullOrUndefined} from 'util';

@Injectable()


export class ValidationService {

  // TODO: I18n these messages,
  //       store them in firebase,
  //       and store the config in firebase
  //
  static messages = {
    MSG_INVALID: 'Invalid entry.',
    MSG_REQUIRED: 'Required entry.',
    MSG_NUMERIC: 'Numerics are required.',
    MSG_PRICE_REQUIRED: 'Price is required.',
    MSG_PRICE_PATTERN: 'Price must be numeric',
    MSG_QUANTITY_REQUIRED: 'Quantity is required.',
    MSG_QUANTITY_PATTERN: 'Quantity must be numeric.'
  };

  // Mapping from field->error to a specific error message
  //
  static config = {
    price: {
      required: ValidationService.messages.MSG_PRICE_REQUIRED,
      pattern: ValidationService.messages.MSG_PRICE_PATTERN
    },
    quantity: {
      required: ValidationService.messages.MSG_QUANTITY_REQUIRED,
      pattern: ValidationService.messages.MSG_QUANTITY_PATTERN
    },
    any: {
      required: ValidationService.messages.MSG_REQUIRED,
      pattern: ValidationService.messages.MSG_INVALID
    }
  }

  private static formatErrorMessage(message: string, argumentList: any): string {
    let more = true;
    let begin = 0;
    let argumentNumber = 0;
    do {
      const index = message.indexOf('%', begin);
      if (index < 0) {
        more = false;
      } else if (argumentNumber > argumentList.length - 1) {
        more = false;
      }
      begin = index + 1;
      message = message.replace('%', argumentList[argumentNumber++]);
    } while (more);
    return message;
  }


  static getValidatorErrorMessage(property: string, error: string, validatorValues?: any) {

    let msg: string = null;
    let obj: any;

    if (ValidationService.config.hasOwnProperty(property)) {
      obj = ValidationService.config[property];
    } else {
      obj = ValidationService.config['any'];
    }
    if (obj.hasOwnProperty(error)) {
      msg = obj[error];
    }

    if (error === 'required') {
      return msg;
    }
    if (typeof validatorValues === 'undefined') {
      return msg;
    } else {
      const argumentList = [];
      argumentList.push(validatorValues);
      return ValidationService.formatErrorMessage(msg, argumentList);
    }
  }

  static creditCardValidator(control) {
    // Visa, MasterCard, American Express, Diners Club, Discover, JCB
    if (control.value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
      return null;
    } else {
      return {'invalidCreditCard': true};
    }
  }

  static emailValidator(control) {
    // RFC 2822 compliant regex
    if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
      return null;
    } else {
      return {'invalidEmailAddress': true};
    }
  }

  static passwordValidator(control) {
    // {6,100}           - Assert password is between 6 and 100 characters
    // (?=.*[0-9])       - Assert a string has at least one number
    if (control.value.match(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,100}$/)) {
      return null;
    } else {
      return {'invalidPassword': true};
    }
  }
}
