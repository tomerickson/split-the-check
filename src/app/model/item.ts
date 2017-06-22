export class Item implements IDomainObject {
  key: string;
  order: string;
  description: string;
  quantity: number = 0;
  instructions: string;
  price: number = 0;
  value: number = 0;

  constructor(orderId?: string) {
    if (typeof orderId !== "undefined")
      this.key = orderId;
    }
  }
