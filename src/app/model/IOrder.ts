import { IDomainObject } from 'app/model';
import { IItem } from './IItem';
import { Observable } from 'rxjs/Observable';

export interface IOrder extends IDomainObject {
  key: string;
  name: string; // Name of person who placed order
  paid: number; // Amount paid
  items: Observable<IItem[]>
}
