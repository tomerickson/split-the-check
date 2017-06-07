import {Injectable} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import {TipBasis} from '../model/tip-basis';
import {Thenable} from "firebase/app";

@Injectable()


export class DataProviderService {

  // Constants
  //
  private MSG_SUCCESS = " succeeded.";
  private MSG_FAIL = " failed.";
  private MSG_PUSH = 'push';
  private MSG_SET = "set";
  private MSG_LIST = "list";
  private MSG_OBJECT = "object";
  private MSG_QUERY = "query";
  private MSG_REMOVE = "remove";

  private static primitiveTypes = ['string', 'float', 'number', 'date', 'boolean'];
  private db: AngularFireDatabase;
  private LOG: boolean = true;

  constructor(fb: AngularFireDatabase) {
    this.db = fb;
  }

  getList(path: string): FirebaseListObservable<any[]> {
    if (this.LOG) console.log('firebase.getList path: ' + path);
    try {
      return this.db.list(path);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  getItem(path: string): FirebaseObjectObservable<any> {
    if (this.LOG) console.log('firebase.getItem path: ' + path);
    try {
      if (this.LOG) {
        console.log(this.setLogInfo("getItem", path, "") + " succeeded.");
      }
      return this.db.object(path);
    } catch (err) {
      console.log(this.setLogInfo("getItem", path));
      throw err;
    }
  }

  push(path: string, value: object): Thenable<any> {
    return this.db.list(path).push(value)
      .then(() => {
        if (this.LOG) {
          console.log(this.setLogInfo("push", path, value) + " succeeded.");
        }
      })
      .catch(err => {
        console.log(this.setLogInfo("push", path, value) + " failed.");
        throw(err);
      });
  }

  update(path: string, object: object): Thenable<any> {
    return this.db.object(path).update(object)
      .then(() => {
        if (this.LOG) {
          console.log(this.setLogInfo("update", path, object) + " succeeded.");
        }
      })
      .catch(err => {
        console.log(this.setLogInfo("update", path, object) + " failed.");
        throw(err);
      });
  }

  set(path: string, value: any):  Thenable<any> {
    return this.db.object(path).set(value)
      .then(() => {
        if(this.LOG) {
          console.log(this.setLogInfo("set", path, value) + " succeeded.");
        }
      })
      .catch(err => {
        if (this.LOG) {
          console.log(this.setLogInfo("set", path, value) + " failed.");
        }
      })
  }

  query(path: string, filter: any): FirebaseListObservable<any> {
    try {
      let result = this.db.list(path, {query: filter});
      if (this.LOG) {
        console.log(this.setLogInfo("query", path, filter) + " succeeded.");
      }
      return result;
    } catch (err) {
      console.log(this.setLogInfo("query", path, filter) + " failed.");
    }
  }

  mockQuery(): FirebaseListObservable<TipBasis[]> {
    let result: FirebaseListObservable<TipBasis[]> = null;
    try {
      result = this.db.list('/enumerations/tipOptions/',
        {
          query: {
            orderByChild: 'isDefault',
            equalTo: true,
            limitToFirst: 1
          }
        });
    } catch (e) {
      console.log(e)
    }
    return result;
  }

  // Assert that the incoming variable
  // a primitive javascriprt type
  //
  private isPrimitive(unknown: any): boolean {
    return (DataProviderService.primitiveTypes.indexOf(typeof unknown)) >= 0;
  }

  // Assemble a message to be logged.
  //
  private setLogInfo(method: string, path: string, value: any = null): string {
    return "firebase." + method + " "
      + (value == null) ? "" : JSON.stringify(value)
      + " path: " + path;
  }
}
