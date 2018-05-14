import { Injectable, Inject, OnDestroy } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject, QueryFn } from 'angularfire2/database';
import { isNullOrUndefined } from 'util';
import { ThenableReference } from '@firebase/database-types';

@Injectable()

export class DataProviderService implements OnDestroy {

  // Constants
  //
  private MSG_SUCCESS = ' succeeded.';
  private MSG_FAIL = ' failed.';
  private MSG_PUSH = 'push';
  private MSG_SET = 'set';
  private MSG_LIST = 'list';
  private MSG_MOVE = 'move_node';
  private MSG_COPY = 'copy_node';
  private MSG_OBJECT = 'object';
  private MSG_QUERY = 'query';
  private MSG_REMOVE = 'remove';
  private MSG_REMOVECHILD = 'remove_child';
  private MSG_UPDATE = 'update';
  private MSG_DISCONNECT = 'goOffline';
  private MSG_CONNECT = 'goOnline';

  private readonly LOG = true;
  db: AngularFireDatabase;

  constructor(@Inject(AngularFireDatabase) fb: AngularFireDatabase) {
    this.db = fb;
    try {
      this.db.database.goOnline();
      this.logSuccess(this.MSG_CONNECT, '', '', this.db.database.app.name);
    } catch (e) {
        this.logFailure(this.MSG_CONNECT, '', '', JSON.stringify(e));
        throw(e);
    }
  }

  ngOnDestroy() {
    try {
      this.db.database.goOffline();
      if (this.LOG) {
        this.logSuccess(this.MSG_DISCONNECT, '');
      }
    } catch (e) {
      if (this.LOG) {
        this.logTask(this.MSG_DISCONNECT, '', '', false, e);
      }
    }
  }

  getList<T>(path: string): AngularFireList<T> {
    return this.db.list<T>(path);
  }

  activator<T>(type: { new(): T; }): T {
    return new type();
  }

  getObject<T>(path: string): AngularFireObject<T> {
    return this.db.object<T>(path);
    // this.logSuccess(this.MSG_OBJECT, path, result);
    // return result;
  }

  push<T>(path: string, value: T): ThenableReference {
    let result: ThenableReference = null;
    try {
      result = this.db.database.ref(path).push(value);
      this.logSuccess(this.MSG_PUSH, path, value, 'key: ' + result.key);
    } catch (err) {
      this.logFailure(this.MSG_PUSH, path, err);
    }
    return result;
  }

  // Update the object to reflect the content
  // of the 'changes' object.
  //
  updateObject<T>(path: string, changes: T): Promise<void> {
    return this.db.object<T>(path).update(changes)
      .then(_ => {
        this.logSuccess(this.MSG_UPDATE, path, changes);
      })
      .catch(err => {
        this.logFailure(this.MSG_UPDATE, path, changes, err);
      });
  }

  set(path: string, value: any): Promise<any> {
    return this.db.object(path).set(value)
      .then(() => {
        this.logSuccess(this.MSG_SET, path, value);
      })
      .catch(err => {
        this.logFailure(this.MSG_SET, path, value, err);
        throw (err);
      });
  }

  query<T>(path: string, query: QueryFn): AngularFireList<T> {

    return this.db.list<T>(path, query);
  }

  removeChild(path: string, childId: string): Promise<any> {
    return this.db.database.ref(path).child(childId).remove()
      .then(() =>  {
        if (this.LOG) {
          this.logSuccess(this.MSG_REMOVECHILD, path, childId);
        }
      }, err => {
        this.logFailure(this.MSG_REMOVECHILD, path, childId, err);
        throw (err);
      });
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
      });
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
        // let msg = 'firebase.' + method + ' ';
        const json = ((isNullOrUndefined(value)) ? '' : JSON.stringify(value));
        const msg = (success) ? this.MSG_SUCCESS : this.MSG_FAIL;
        const err = (error) ? ' ' + JSON.stringify(error) : '';
        // msg += 'value: ' + ((isNullOrUndefined(value)) ? '' : JSON.stringify(value));
        // msg += ' path: ' + path;
        // msg += ' ';
        // msg += (success) ? this.MSG_SUCCESS : this.MSG_FAIL;
        // msg += (error) ? ' ' + JSON.stringify(error) : '';
        // logFn(msg)
        logFn(`firebase.${method} value: ${json} path: ${path} ${msg} ${err}`);
      }
    }
  }
}
