import {Injectable} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import {TipBasis} from '../model/tip-basis';
import {Thenable} from "firebase/app";
import {Observable} from "rxjs/Observable";

@Injectable()


export class DataProviderService {

  // Constants
  //
  private MSG_SUCCESS = " succeeded.";
  private MSG_FAIL = " failed.";
  private MSG_GET = 'getList';
  private MSG_PUSH = 'push';
  private MSG_SET = "set";
  private MSG_LIST = "list";
  private MSG_OBJECT = "object";
  private MSG_QUERY = "query";
  private MSG_REMOVE = "remove";
  private MSG_UPDATE = "update";

  private static primitiveTypes = ['string', 'float', 'number', 'date', 'boolean'];
  private db: AngularFireDatabase;
  private LOG: boolean = true;

  constructor(fb: AngularFireDatabase) {
    this.db = fb;
  }

  getList(path: string, take?: any): FirebaseListObservable<any[]> {
    let result: FirebaseListObservable<any> = null;
    try {
      if (!take.isNullOrUndefined()) {
        result = this.db.list(path).take(take) as FirebaseListObservable<any>;
      } else {
        result = this.db.list(path);
      }
      if (this.LOG) this.logTask(this.MSG_LIST, path, null, true);
    } catch (err) {
      this.logTask(this.MSG_LIST, path, null, false);
      throw err;
    }
    return result;
  }

  getItem(path: string, take?: any): FirebaseObjectObservable<any> {
    let result: FirebaseObjectObservable<any>;
    try {
      if (!take.isNullOrUndefined()) {
        result = this.db.object(path).take(take) as FirebaseObjectObservable<any>;
      }  else {
         result = this.db.object(path);
      }
      if (this.LOG) this.logTask(this.MSG_OBJECT, path, null, true);
    } catch (err) {
      this.logTask(this.MSG_OBJECT, path, null, false);
      throw err;
    }
    return result;
  }

  push<T>(path: string, value: T): Thenable<T> {
    return this.db.list(path).push(value)
      .then(() => {
        if (this.LOG) this.logTask(this.MSG_PUSH, path, value, true);
      })
      .catch(err => {
        this.logTask(this.MSG_PUSH, path, value, false);
        throw(err);
      });
  }

  update(path: string, object: object): Thenable<any> {
    return this.db.object(path).update(object)
      .then(() => {
        if (this.LOG) this.logTask(this.MSG_UPDATE, path, object, true);
      })
      .catch(err => {
        this.logTask(this.MSG_UPDATE, path, object, false);
        throw(err);
      });
  }

  set(path: string, value: any):  Thenable<any> {
    return this.db.object(path).set(value)
      .then(() => {
        if(this.LOG) this.logTask(this.MSG_SET, path, value, true);
      })
      .catch(err => {
          this.logTask(this.MSG_SET, path, value, false);
          throw(err);
      })
  }

  query(path: string, filter: any): FirebaseListObservable<any> {
    try {
      let result = this.db.list(path, {query: filter});
      if (this.LOG) this.logTask(this.MSG_QUERY, path, filter, true);
      return result;
    } catch (err) {
      this.logTask(this.MSG_QUERY, path, filter, false);
      throw(err);
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

  // Log the action
  //
  // TODO: Replace this with a decorator?
  private logTask(method: string, path: string, value: any = null, success: boolean = false) {
    let msg = "firebase." + method + " ";
    msg += ((value === null) ? "" : JSON.stringify(value));
    msg += " path: " + path;
    msg += " ";
    msg += (success) ? this.MSG_SUCCESS : this.MSG_FAIL;
    console.log(msg);
  }
}
