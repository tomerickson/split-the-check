import { BoundObject } from './boundobject';
import { ItemBase } from './itembase';

export class OrderBase extends BoundObject {
  name = ''; // Name of person who placed order
  paid = 0; // Amount paid
  items: ItemBase[];
  constructor() {
    super();
  }
}
