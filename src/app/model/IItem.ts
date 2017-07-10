interface IItem extends IDomainObject {
  orderId: string;
  description: string;
  quantity: number;
  price: number;
  instructions: string;
}
