import { Injectable, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore'
// import { AngularFireDatabase } from 'angularfire2/database';
import { TipBasis } from '../model/tip-basis';
import 'rxjs/add/operator/take';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase';
import DocumentSnapshot = firebase.firestore.DocumentSnapshot;
import { Action } from 'angularfire2/firestore/interfaces';

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

  // db: AngularFireDatabase;
  afs: AngularFirestore;

  constructor(fs: AngularFirestore) {
    // this.db = fb;
    this.afs = fs;
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

  getListWithMetadata<T>(path: string): AngularFirestoreCollection<T> {
    return this.afs.collection(path) as AngularFirestoreCollection<T>;
  }

  getList<T>(path: string, take?: any): Observable<T[]> {
    let result = this.afs.collection(path).valueChanges() as Observable<T[]>;
    if (take) {
      result = result.take(take);
    }
    return result;
  }

  getObject<T>(path: string, take?: any) {
    return this.afs.doc(path).valueChanges() as Observable<T>;
  }

  activator<T>(type: { new(): T ; } ): T {
    return new type();
  }

  getItemWithKey<T> (path: string): AngularFirestoreDocument<T> {
    return this.afs.doc<T>(path);
  }

  getRawItem<T>(docPath: string) {
    let result = null;
    this.afs
      .doc<T>(docPath)
      .snapshotChanges()
      .map(obs => result = obs);
    return result;
  }

  getItem<T>(path: string): Observable < T > {
    const result: Observable<T> = null;
    try {
        this.afs.doc<T>(path).valueChanges().map(obs => {
          if (this.LOG) {
          this.logSuccess(this.MSG_OBJECT, path, JSON.stringify(obs));
          }
          return obs;
        })
    } catch (err) {
      this.logTask(this.MSG_OBJECT, path, null, false);
      throw err;
    }
    return result;
  }

  push<T>(path: string, value: T): Promise < void > {
    return this.afs.collection(path).add(value)
      .then(() => {
        if (this.LOG) {
          this.logTask(this.MSG_PUSH, path, value, true);
        }
      })
      .catch(err => {
        this.logTask(this.MSG_PUSH, path, value, false);
        throw(err);
      });
  }

  updatePath(path: string, newObject: object): Promise < any > {
    return this.afs.doc(path).update(newObject)
      .then(() => {
        if (this.LOG) {
          this.logTask(this.MSG_UPDATE, path, newObject, true);
        }
      })
      .catch(err => {
        this.logTask(this.MSG_UPDATE, path, newObject, false);
        throw(err);
      });
  }

  // Update the object to reflect the content
  // of the 'changes' object.
  //
  updateObject(path: string, changes: object): Promise < void > {
    const obj = this.afs.doc(path);
    return obj.update(changes)
      .then(_ => {
        if (this.LOG) {
          this.logTask(this.MSG_UPDATE, path, changes, true);
        }
      })
      .catch(err => {
        if (this.LOG) {
          this.logTask(this.MSG_UPDATE, path, changes, false);
        }
      })
  }

  set(path: string, value: any): Promise < void > {
    return this.afs.doc(path).set(value)
      .then(() => {
        if (this.LOG) {
          this.logTask(this.MSG_SET, path, value, true);
        }
      })
      .catch(err => {
        this.logTask(this.MSG_SET, path, value, false);
        throw(err);
      })
  }

  query<T>(path: string, filter: any): Observable < T[] > {
    let result = null;
      result = this.afs.collection(path, filter).valueChanges() as Observable<T[]>;
      if (this.LOG) {
        this.logTask(this.MSG_QUERY, path, filter, true);
      }
    return result;
  }

  remove(path: string): Promise < any > {
    return this.afs.doc(path).delete()
      .then(() => {
        if (this.LOG) {
          this.logTask(this.MSG_REMOVE, path, null, true);
        }
      })
      .catch(err => {
        this.logTask(this.MSG_REMOVE, path, null, false);
        throw(err);
      })
  }

  copyNode(oldPath: string, newPath: string): boolean {
    let success = false;
    let node;
    const oldRef = this.afs.doc(oldPath).valueChanges().map(obj => node = obj.valueOf());
    // debugger;
    const newRef = this.afs.doc(newPath);
    newRef.set(oldRef)
      .then((oldOutcome) => {
        success = true;
        if (this.LOG) {
          this.logSuccess(this.MSG_COPY, oldPath, newPath, oldOutcome);
          return true;
        }
      })
      .catch((oldOutcome) => {
        if (this.LOG) {
          this.logFailure(this.MSG_COPY, oldPath, newPath, oldOutcome);
          return false;
        }
      });
    return success;
  }

  moveNode(oldPath, newPath): boolean {
    let success = false;
    const newRef = this.afs.doc(newPath);
    newRef.set(this.afs.doc(oldPath))
      .then((newOutcome) => {
        success = true;
        this.afs.doc(oldPath).delete()
          .then((oldOutcome) => {
            if (this.LOG) {
              this.logSuccess(this.MSG_MOVE, oldPath, newPath, oldOutcome);
              return true;
            }
          })
          .catch((oldOutcome) => {
            success = false;
            if (this.LOG) {
              this.logFailure(this.MSG_MOVE, oldPath, newPath, oldOutcome);
            }
            return false;
          })
      })
      .catch((newOutcome) => {
        success = false;
        if (this.LOG) {
          this.logFailure(this.MSG_MOVE, oldPath, newPath, newOutcome);
        }
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

  mockQuery(): Observable < TipBasis[] > {
    let result: AngularFirestoreCollection<TipBasis> = null;
    try {
      result = this.afs.collection('/enumerations/tipOptions/', ref => ref.orderBy('isDefault').limit(1));

    } catch (e) {
      console.log(e)
    }
    return result.valueChanges();
  }

  identity<T>(arg?: T): T {
    return arg as T;
  }

  logSuccess(method: string, path: string, value: any = null, message ?: any) {
    this.logTask(method, path, value, true, message);
  }

  logFailure(method: string, path: string, value: any = null, message ?: any) {
    this.logTask(method, path, value, false, message);
  }

  // Log the action
  //
  // TODO: Replace this with a decorator?
  private logTask(method: string, path: string, value: any = null, success: boolean = false, error?: any) {
    if (typeof(console) !== 'undefined') {

      // Use console.info for success messages and console.error
      // for error messages - if it's available.
      //
      let logFn: Function = (success) ? console.info : console.error;
      if (typeof logFn === 'undefined' && !success) {
        logFn = console.info;
      }

      if (logFn) {
        let msg = 'firebase.' + method + ' ';
        msg += ((value === null) ? '' : JSON.stringify(value));
        msg += ' path: ' + path;
        msg += ' ';
        msg += (success) ? this.MSG_SUCCESS : this.MSG_FAIL;
        msg += (error) ? ' ' + JSON.stringify(error) : '';
        logFn(msg);
      }
    }
  }
}
