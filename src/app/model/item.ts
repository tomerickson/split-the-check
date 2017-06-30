export class Item implements IDomainObject {
  key: string;
  orderId: string;
  description: string = "";
  quantity: number = 0;
  instructions: string = "";
  price: number = 0;
  value: number = 0;

  constructor(orderId: string) {
      this.orderId = orderId;
    }
  }
