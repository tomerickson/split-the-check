import { IDomainObject } from 'app/model';

export interface IOrder extends IDomainObject {
  key: string;
  name: string; // Name of person who placed order
  paid: number; // Amount paid
}
