import { Injectable, Inject, OnDestroy } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { TipBasis } from '../model/tip-basis';
import 'rxjs/add/operator/take';
import * as firebase from 'firebase';

@Injectable()

export class DataProviderService implements OnDestroy {

  // Constants
  //
  private MSG_SUCCESS = ' succeeded.';
  private MSG_FAIL = ' failed.';
  private MSG_PUSH = 'push';
  private MSG_SET = 'set';
  private MSG_LIST = 'get_list';
  private MSG_MOVE = 'move_node';
  private MSG_COPY = 'copy_node';
  private MSG_OBJECT = 'get_object';
  private MSG_QUERY = 'query';
  private MSG_REMOVE = 'remove';
  private MSG_UPDATE = 'update';
  private MSG_DISCONNECT = 'goOffline';

  private LOG = true || false;
  db: AngularFireDatabase;

  constructor(@Inject(AngularFireDatabase) fb: AngularFireDatabase) {
    this.db = fb;
  }

  ngOnDestroy() {
    try {
      if (this.LOG) {
        this.logTask(this.MSG_DISCONNECT, '', '', true);
      }
    } catch (e) {
      if (this.LOG) {
        this.logTask(this.MSG_DISCONNECT, '', '', false, e);
      }
    }
  }

  getList<T>(path: string): AngularFireList<T> {
    let result: AngularFireList<T>;
    try {
      result = this.db.list<T>(path);
      this.logSuccess(this.MSG_LIST, path, JSON.stringify(result));
    } catch (err) {
      this.logFailure(this.MSG_LIST, path, null, err);
    }
    return result;
  }

  activator<T>(type: { new(): T; }): T {
    return new type();
  }

  getItem<T>(path: string): AngularFireObject<T> {
    let result: AngularFireObject<T> = null;
    try {
      result = this.db.object<T>(path);
      this.logSuccess(this.MSG_OBJECT, path, JSON.stringify(result));
    } catch (err) {
      this.logFailure(this.MSG_OBJECT, path, null, err);
      throw err;
    }
    return result;
  }

  push<T>(path: string, value: T): Promise<void> {
    let result = null;
    try {
      result = this.db.list(path).push(value);
      this.logSuccess(this.MSG_PUSH, path, value, true);
    } catch (err) {
      this.logFailure(this.MSG_PUSH, path, err);
    }
    return result;
  }

  updatePath(path: string, newObject: object): Promise<any> {
    return this.db.object(path).update(newObject)
      .then(() => {
        this.logTask(this.MSG_UPDATE, path, newObject);
      })
      .catch(err => {
        this.logFailure(this.MSG_UPDATE, path, newObject, err);
        throw (err);
      });
  }

  // Update the object to reflect the content
  // of the 'changes' object.
  //
  updateObject<T>(path: string, changes: T): Promise<void> {
    const obj = this.db.object<T>(path);
    return obj.update(changes)
      .then(_ => {
        this.logSuccess(this.MSG_UPDATE, path, changes);
      })
      .catch(err => {
        this.logFailure(this.MSG_UPDATE, path, changes, err);
      })
  }

  set(path: string, value: any): Promise<void> {
    return this.db.object(path).set(value)
      .then(() => {
        this.logSuccess(this.MSG_SET, path, value);
      })
      .catch(err => {
        this.logFailure(this.MSG_SET, path, value, err);
        throw (err);
      })
  }

  query<T>(path: string, query: any): AngularFireList<T> {
    let result: AngularFireList<T> = null;
    try {
      result = this.db.list<T>(path, ref => query);
      this.logSuccess(this.MSG_QUERY, path, query);
    } catch (err) {
      this.logFailure(this.MSG_QUERY, path, null, err);
    }
    return result;
  }

  remove(path: string): Promise<any> {
    return this.db.object(path).remove()
      .then(() => {
        if (this.LOG) {
          this.logTask(this.MSG_REMOVE, path, null, true);
        }
      })
      .catch(err => {
        this.logTask(this.MSG_REMOVE, path, null, false);
        throw (err);
      })
  }

  copyNode(oldPath: string, newPath: string): boolean {
    let success = false;
    let node;
    const oldRef = this.db.object(oldPath).valueChanges().map(obj => node = obj.valueOf());
    // debugger;
    const newRef = this.db.object(newPath);
    newRef.set(oldRef)
      .then((oldOutcome) => {
        success = true;
        this.logSuccess(this.MSG_COPY, oldPath, newPath, oldOutcome);
        return true;
      })
      .catch((oldOutcome) => {
        this.logFailure(this.MSG_COPY, oldPath, newPath, oldOutcome);
        return false;
      });
    return success;
  }

  moveNode(oldPath, newPath): boolean {
    let success = false;
    const newRef = this.db.object(newPath);
    newRef.set(this.db.object(oldPath))
      .then((newOutcome) => {
        success = true;
        this.db.object(oldPath).remove()
          .then((oldOutcome) => {
            this.logSuccess(this.MSG_MOVE, oldPath, newPath, oldOutcome);
            return true;
          })
          .catch((oldOutcome) => {
            success = false;
            this.logFailure(this.MSG_MOVE, oldPath, newPath, oldOutcome);
            return false;
          })
      })
      .catch((newOutcome) => {
        success = false;
        this.logFailure(this.MSG_MOVE, oldPath, newPath, newOutcome);
        return false;
      });

    if (success) {
      if (this.LOG) {
        this.logTask(this.MSG_MOVE, oldPath, newPath, true, null);
      }
      return true;
    }
    return success;
  }

  mockQuery(): AngularFireList<TipBasis> {
    let result: AngularFireList<TipBasis> = null;
    try {
      result = this.db.list<TipBasis>('/enumerations/tipOptions/', ref => ref.orderByChild('isDefault').equalTo(true));

    } catch (e) {
      console.log(e)
    }
    return result;
  }

  identity<T>(arg?: T): T {
    return arg as T;
  }

  logSuccess(method: string, path: string, value: any = null, message?: any) {
    if (this.LOG) {
      this.logTask(method, path, value, true, message);
    }
  }

  logFailure(method: string, path: string, value: any = null, message?: any) {
    if (this.LOG) {
      this.logTask(method, path, value, false, message);
    }
  }

  // Log the action
  //
  // TODO: Replace this with a decorator?
  private logTask(method: string, path: string, value: any = null, success: boolean = false, error?: any) {
    if (typeof (console) !== 'undefined') {

      // Use console.info for success messages and console.error
      // for error messages - if it's available.
      //
      let logFn: Function = (success) ? console.info : console.error;
      if (typeof logFn === 'undefined' && !success) {
        logFn = console.info;
      }

      if (logFn) {
        let msg = 'firebase.' + method + ' ';
        msg += ((value === null || value === undefined) ? '' : JSON.stringify(value));
        msg += ' path: ' + path;
        msg += ' ';
        msg += (success) ? this.MSG_SUCCESS : this.MSG_FAIL;
        msg += (error) ? ' ' + JSON.stringify(error) : '';
        logFn(msg);
      }
    }
  }
}
