/**
 * Data-bound objects will always have a unique identifier
 * named 'key'.  Key will be populated from the payload.key
 * property of AngularFire[Object|List].snapshotChanges()
 * when an object is pushed.
 *
 * DataStoreServices will delete the key property from
 * the BoundObject and append it to the firebase path
 * when updating.
 */
export class BoundObject {
  key: string; // Key auto-assigned by firebase
}
