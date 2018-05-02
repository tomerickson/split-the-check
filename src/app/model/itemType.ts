import { BoundObject } from './boundobject';

export class ItemType extends BoundObject {
  orderId: string;
  description: string;
  quantity: number;
  price: number;
  instructions: string;

  constructor() {
    super();
  }
}
