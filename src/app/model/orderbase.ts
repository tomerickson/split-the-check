import { BoundObject } from './boundobject';
import { ItemBase } from './itembase';

export class OrderBase extends BoundObject {
  name: string; // Name of person who placed order
  paid: number; // Amount paid
  items: ItemBase[];
  constructor() {
    super();
  }
}
