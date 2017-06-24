import {Injectable} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import {TipBasis} from '../model/tip-basis';
import {Thenable} from "firebase/app";
import {Observable} from "rxjs/Observable";
import {QueryReference} from "angularfire2/interfaces";

@Injectable()

export class DataProviderService {

  // Constants
  //
  private MSG_SUCCESS = " succeeded.";
  private MSG_FAIL = " failed.";
  private MSG_PUSH = 'push';
  private MSG_SET = "set";
  private MSG_LIST = "get_list";
  private MSG_MOVE = 'move_node';
  private MSG_COPY = 'copy_node';
  private MSG_OBJECT = "get_object";
  private MSG_QUERY = "query";
  private MSG_REMOVE = "remove";
  private MSG_UPDATE = "update";

  private static primitiveTypes = ['string', 'float', 'number', 'date', 'boolean'];
  private LOG: boolean = true;

  db: AngularFireDatabase;

  constructor(fb: AngularFireDatabase) {
    this.db = fb;
  }

  getList(path: string, preserveSnapshot?: boolean, take?: any): FirebaseListObservable<any[]> {
    let result: FirebaseListObservable<any[]> = null;
    try {
      if (preserveSnapshot === true) {
        result = this.db.list(path, {preserveSnapshot: true});
      } else {
        result = this.db.list(path);
      }
      if (typeof take != "undefined") {
        result = result.take(take) as FirebaseListObservable<any[]>;
      }
      if (this.LOG) this.logTask(this.MSG_LIST, path, null, true);
    } catch (err) {
      this.logTask(this.MSG_LIST, path, null, false);
      throw err;
    }
    return result;
  }

  getItem(path: string): FirebaseObjectObservable<any> {
    let result: FirebaseObjectObservable<any>;
    try {
      result = this.db.object(path);
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

  updatePath(path: string, newObject: object): Thenable<any> {
    return this.db.object(path).update(newObject)
      .then(() => {
        if (this.LOG) this.logTask(this.MSG_UPDATE, path, newObject, true);
      })
      .catch(err => {
        this.logTask(this.MSG_UPDATE, path, newObject, false);
        throw(err);
      });
  }

  updateObject(observable: FirebaseObjectObservable<any>, newObject: object): Thenable<any> {
    return observable.update(newObject)
      .then(() => {
        if (this.LOG) this.logTask(this.MSG_UPDATE, observable.$ref.key, newObject, true);
      })
      .catch(err => {
        this.logTask(this.MSG_UPDATE, observable.$ref.key, newObject, false);
      })
  }

  set(path: string, value: any): Thenable<any> {
    return this.db.object(path).set(value)
      .then(() => {
        if (this.LOG) this.logTask(this.MSG_SET, path, value, true);
      })
      .catch(err => {
        this.logTask(this.MSG_SET, path, value, false);
        throw(err);
      })
  }

  query(path: string, filter: any, preserveSnapshot?:boolean): FirebaseListObservable<any> {
    try {
      let result = this.db.list(path, {query: filter});
      if (this.LOG) this.logTask(this.MSG_QUERY, path, filter, true);
      return result;
    } catch (err) {
      this.logTask(this.MSG_QUERY, path, filter, false);
      throw(err);
    }
  }

  remove(path: string) {
    return this.db.object(path).remove()
      .then(() => {
        if (this.LOG) this.logTask(this.MSG_REMOVE, path, null, true);
      })
      .catch(err => {
        this.logTask(this.MSG_REMOVE, path, null, false);
        throw(err);
      })
  }

  copyNode(oldPath: string, newPath: string): boolean {
    let success = false;
    let oldRef = this.db.object(oldPath).$ref;
    let newRef = this.db.object(newPath).$ref;
    oldRef.once('value', (snap) => {
      newRef.set(snap.val(), ((error) => {
        success = true;
        if (error) {
          success = false;
          this.logTask(this.MSG_COPY, oldPath, newPath, false, error);
        } else {
          this.logTask(this.MSG_COPY, oldPath, newPath, true);
        }
      }));
    });
    return true;
  }

  moveNode(oldPath, newPath): boolean {
    let success = false;
    let oldRef = this.db.object(oldPath).$ref;
    let newRef = this.db.object(newPath).$ref;
    oldRef.once('value', (snap) => {
      newRef.set(snap.val(), (error) => {
          if (!error) {
            success = true;
            oldRef.remove();
          } else {
            this.logTask(this.MSG_MOVE, oldPath, newPath, false, error);
          }
        }
      )
    });
    return success;
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
  logTask(method: string, path: string, value: any = null, success: boolean = false, error?: any) {
    if (typeof(console) !== "undefined") {

      // Use console.info for success messages and console.error
      // for error messages - if it's available.
      //
      let logFn: Function = (success) ? console.info : console.error;
      if (typeof logFn === "undefined" && !success) {
        logFn = console.info;
      }

      if (logFn) {
        let msg = "firebase." + method + " ";
        msg += ((value === null) ? "" : JSON.stringify(value));
        msg += " path: " + path;
        msg += " ";
        msg += (success) ? this.MSG_SUCCESS : this.MSG_FAIL;
        msg += (error) ? " " + JSON.stringify(error) : "";
        logFn(msg);
      }
    }
  }
}
