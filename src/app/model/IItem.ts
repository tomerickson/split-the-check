import { IDomainObject } from './IDomainObject';

export interface IItem extends IDomainObject {
  orderId: string;
  description: string;
  quantity: number;
  price: number;
  instructions: string;
}
