import {Injectable} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from "angularfire2/database";
import {TipBasis} from "../model/tip-basis";

@Injectable()

export class DataServiceService {

  private db: AngularFireDatabase;

  constructor(fb: AngularFireDatabase) {
    this.db = fb;
  }

  getList(path: string): FirebaseListObservable<any[]> {
    let result:FirebaseListObservable<any[]> = null;
    try {
      result = this.db.list(path);
    }
    catch (e) {
      console.log(e);
    }
    return result;
  }

  getItem(path: string): FirebaseObjectObservable<any> {
    try {
      return this.db.object(path);
    }
    catch (e) {
      console.log(e);
    }
  }

  push(path: string, value: object){
    this.db.app.database().ref('path').push(value)
    return this.db.app.database().ref('x').push(value);


  }

  query(path: string, filter: any) {
    try {
      return this.db.list(path,
        {query: filter});
    }
    catch (e) {
      console.log(e);
    }
  }

  mockQuery(): FirebaseListObservable<TipBasis[]> {
    let result: FirebaseListObservable<TipBasis[]> = null;
    try {
      result = this.db.list("/enumerations/tipOptions/",
        {query: {orderByChild: "isDefault",
          equalTo: true,
        limitToFirst: 1}});
    }
    catch(e) {
      console.log(e)
    }
    return result;
  }
}
