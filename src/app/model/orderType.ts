import { BoundObject } from './boundobject';
import { ItemType } from './itemType';

export class OrderType extends BoundObject {
  name = 'New Order'; // Name of person who placed order
  paid = 0; // Amount paid
  items: ItemType[];
  constructor() {
    super();
  }
}
