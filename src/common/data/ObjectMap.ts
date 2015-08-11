



module bwk.common.data {



  export class ObjectMap<K, V> {

    lookup: Object;
    keyList: Array<K>;

    static getIdFnName: string = '__getId__';


    constructor() {
      this.keyList = [];
      this.lookup = {};
    }


    static counter: number = 0;

    static nextId(): string {
      ObjectMap.counter += 1;
      return 'o' + String(ObjectMap.counter);
    }

    static getId(obj): string {
      if (!obj[ObjectMap.getIdFnName]) {
        var id = ObjectMap.nextId();
        obj[ObjectMap.getIdFnName] = function() {
          return id;
        };
      }
      return obj[ObjectMap.getIdFnName]();
    }

    add(obj: K, value: V): void {
      if (typeof obj !== 'object') throw new Error('key must be an object: ' + (typeof obj));
      var id = ObjectMap.getId(obj);
      if (this.lookup[id] !== undefined) throw new Error('duplicate object key');
      this.lookup[id] = value;
      this.keyList.push(obj);
    }

    remove(obj: K): void {
      if (!this.containsKey(obj)) throw new Error('key not found');
      var keyIndex = this.keyList.indexOf(obj);
      if (keyIndex === -1) throw new Error('key not found using indexOf');
      this.keyList.splice(keyIndex, 1);
      var id = obj[ObjectMap.getIdFnName]();
      delete this.lookup[id];

    }

    get(obj: K): any {
      if (!this.containsKey(obj)) throw new Error('key not found');
      var id = obj[ObjectMap.getIdFnName]();
      return this.lookup[id];
    }

    containsKey(obj: K): boolean {
      if (obj[ObjectMap.getIdFnName]) {
        var id = obj[ObjectMap.getIdFnName]();
        return this.lookup[id] !== undefined;
      }
      else {
        return false;
      }
    }

    each(fn: (k: K, v: V) => void, scope): void {
      var key, i;
      for (i = 0; i < this.keyList.length; i++) {
        key = this.keyList[i];
        fn.call(scope, key, this.lookup[key[ObjectMap.getIdFnName]()]);
      }
    }

    clear(): void {
      this.keyList = [];
      this.lookup = {};
    }



  }


}



/*
module common.data {

  /// this is class is like a dictionary or hashtable where the key is an object instead of a string.

  export class ObjectMap {


    add: (obj: Object, value: any) => void;
    removeKey: (obj: Object) => void;
    get: (obj: Object) => any;
    set: (obj: Object, value: any) => void;
    containsKey: (obj: Object) => boolean;
    clear: () => void;


    //  note, the lookupKey argument is generally not given.
    constructor(lookupKey?: string) {


      var prvt = {
        lookupKey: (ObjectMap.isEmpty(lookupKey) ? '_' + (++ObjectMap.counter) : lookupKey),
        getKey: function(obj, lk) {
          var meta, objectIDs;
          if (!obj || !ObjectMap.isObject(obj)) {
            return null;
          }
          if (!obj[common.data.ObjectMap.getMetaFnName]) {
            objectIDs = {};
            meta = {
              getObjectKey: function(lk2) {
                if (!objectIDs[lk2]) {
                  objectIDs[lk2] = '_' + (++common.data.ObjectMap.keyCounter);
                }
                return objectIDs[lk2];
              }
            };
            obj[common.data.ObjectMap.getMetaFnName] = function() {
              return meta;
            };
          }
          return (obj[common.data.ObjectMap.getMetaFnName]()).getObjectKey(lk);
        },
        objectLookup: {},
        add: function(obj, value) {
          if (!obj || !ObjectMap.isObject(obj)) {
            return;
          }
          prvt.objectLookup[prvt.getKey(obj, prvt.lookupKey)] = value;
        },
        set: function(obj, value) {
          var key;
          if (!obj || !ObjectMap.isObject(obj)) {
            return;
          }
          key = prvt.getKey(obj, prvt.lookupKey);
          prvt.objectLookup[key] = value;
        },
        removeKey: function(obj) {
          if (!obj || !ObjectMap.isObject(obj)) {
            return;
          }
          prvt.objectLookup[prvt.getKey(obj, prvt.lookupKey)] = undefined;
        },
        get: function(obj) {
          if (!obj || !ObjectMap.isObject(obj)) {
            return null;
          }
          return prvt.objectLookup[prvt.getKey(obj, prvt.lookupKey)];
        },
        containsKey: function(obj) {
          if (!obj || !ObjectMap.isObject(obj)) {
            return false;
          }
          return prvt.objectLookup[prvt.getKey(obj, prvt.lookupKey)] !== undefined;
        },
        clear: function() {
          prvt.objectLookup = {};
        }
      };
      // public stuff

      this.add = prvt.add;
      this.removeKey = prvt.removeKey;
      this.get = prvt.get;
      this.set = prvt.set;
      this.containsKey = prvt.containsKey;
      this.clear = prvt.clear;

      return this;
    }


    static getMetaFnName: string = 'getMeta';
    static counter: number = 0;
    static keyCounter: number = 0;

    static isObject(value: any): boolean {
      return typeof value === 'Object' && value !== null;
    }

    static isEmpty(value: any): boolean {
      return value === undefined || value === null;
    }


  }

}
*/
