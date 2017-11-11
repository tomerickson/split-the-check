import { IItem } from './IItem';

export class Item implements IItem {
  orderId: string;
  description: string;
  quantity: number;
  price: number;
  instructions: string;
  key: string;
  }
