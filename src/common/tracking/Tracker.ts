

module common.tracking {


  export class Tracker {

    model: Object;
    version: number;

    subscriptions: Object;

    enableCyclic: boolean;

    items: common.data.ObjectMap<Object, Object>;


    constructor(model: Object, enableCyclic: boolean) {

      var me = this;

      this.enableCyclic = enableCyclic;

      this.model = model;
      this.version = 1;

      this.subscriptions = {};


      var items = new common.data.ObjectMap<Object, Object>();
      this.items = items;

      function isObject(item) {
        return typeof item === 'object' && item !== null;
      }

      function handleChange(change) {
        if (me.subscriptions) {
          me.version += 1;
          change.version = me.version;

          if (me.enableCyclic) {
            change = common.data.JSO.dehydrateClone(change);
          }

          var k, subscription;

          for (k in me.subscriptions) {
            if (me.subscriptions.hasOwnProperty(k)) {
              subscription = me.subscriptions[k];
              if (subscription.active) {
                subscription.onChangeCallback(change);
              }
            }
          }
        }
      }

      function concatPath(path, key) {
        return path + '["' + key + '"]';
      }

      function handleArrayChange(item, path, splices) {

        //console.log('handleArrayChange');

        var i, j, splice, v, meta;
        // splices have addedCount, but we need added data
        for (i = 0; i < splices.length; i++) {
          splice = splices[i];
          if (splice.addedCount) {
            splice.added = item.slice(splice.index, splice.index + splice.addedCount);
            for (j = 0; j < splice.added.length; j++) {
              v = splice.added[j];
              if (isObject(v)) {
                if (items.containsKey(v)) {
                  meta = items.get(v);
                  // swap it for a reference
                  splice.added[j] = 'pth:' + getFirstPath(meta);
                }
              }
            }

          }
        }
        var data = {
          type: 'array',
          path: path,
          splices: splices
        };
        handleChange(data);
      }

      function removePath(item, path) {
        var meta = items.get(item);
        if (!meta.paths[path]) {
          // uh oh, missing path
          return;
        }
        delete meta.paths[path];
        meta.pathCount -= 1;
        if (meta.pathCount === 0) {
          // stop observing
          meta.observer.close();
          // remove from lookup
          items.remove(item);

          // recurse
          var k, v;
          //if (Array.isArray(item)) {
          //for (i = 0; i < item.length; i++) {
          //  v = item[i];
          //  if (isObject(v)) {
          //    removePath(v, path + '.' + i);
          //  }
          //}
          //}
          //else {
          if (!Array.isArray(item)) {
            for (k in item) {
              if (item.hasOwnProperty(k)) {
                v = item[k];
                if (isObject(v)) {
                  removePath(v, concatPath(path, k));
                }
              }
            }
          }

        }
      }

      function getFirstPath(meta) {
        for (var k in meta.paths) {
          if (meta.paths.hasOwnProperty(k)) {
            return k;
          }
        }
        return null;
      }


      function handleObjectChange(item, added, removed, changed, getOldValueFn) {

        //console.log('handleObjectChange');

        var itemMeta = items.get(item);
        var path = getFirstPath(itemMeta);

        var data = {
          type: 'object',
          path: path,
          added: added,
          removed: removed,
          changed: changed
        };

        var k, v, meta;

        for (k in data.added) {
          if (data.added.hasOwnProperty(k)) {
            v = data.added[k];
            if (isObject(v)) {
              if (items.containsKey(v)) {
                meta = items.get(v);
                // adding an object already in the model
                // add the new path
                meta.paths[concatPath(path, k)] = true;
                meta.pathCount += 1;
                // swap it for a reference
                data.added[k] = 'pth:' + getFirstPath(meta);
              }
              else {
                // added an existing object
                track(v, concatPath(path, k));
              }
            }
          }
        }

        for (k in data.changed) {
          if (data.changed.hasOwnProperty(k)) {
            v = data.changed[k];
            if (isObject(v)) {
              if (items.containsKey(v)) {
                meta = items.get(v);
                // changing to an object already in the model
                // add the new path
                meta.paths[concatPath(path, k)] = true;
                meta.pathCount += 1;
                // swap it for a reference
                data.changed[k] = 'pth:' + getFirstPath(meta);
              }
              else {
                // changed: not an existing object
                track(v, concatPath(path, k));
              }
            }
            // check the old value
            v = getOldValueFn(k);
            if (isObject(v)) {
              if (items.containsKey(v)) {
                // remove old value
                removePath(v, concatPath(path, k));
              }
              else {
                throw new Error('this should not happen.  something went wrong. 101');
              }
            }
          }
        }

        for (k in data.removed) {
          if (data.removed.hasOwnProperty(k)) {
            v = data.removed[k];
            if (isObject(v)) {
              if (items.containsKey(v)) {
                // remove removed
                // swap it for a reference
                data.removed[k] = 'pth:' + getFirstPath(meta);
                removePath(v, concatPath(path, k));
              }
              else {
                throw new Error('this should not happen.  something went wrong. 102');
              }
            }
          }
        }

        handleChange(data);
      }


      function track(item, path) {
        var meta, i, k;
        if (isObject(item)) {
          if (items.containsKey(item)) {
            meta = items.get(item);
            meta.paths[path] = true;
            meta.pathCount += 1;
            //duplicate item.
          }
          else {
            meta = {
              paths: {},
              pathCount: 1
            };
            meta.paths[path] = true;
            items.add(item, meta);
            // add observer and recurse
            if (Array.isArray(item)) {

              meta.observer = new ArrayObserver(item);
              meta.observer.open(function(splices) {
                handleArrayChange(item, path, splices);
              });

              //for (i = 0; i < item.length; i++) {
              //  track(item[i], path + '.' + i);
              //}
            }
            else {

              meta.observer = new ObjectObserver(item);
              meta.observer.open(function(added, removed, changed, getOldValueFn) {
                handleObjectChange(item, added, removed, changed, getOldValueFn);
              });

              for (k in item) {
                if (item.hasOwnProperty(k)) {
                  track(item[k], concatPath(path, k));
                }
              }
            }
          }
        }
      }

      track(model, '');

    }


    subscribe(initialDataCallback: (Object) => void, onChangeCallback: (Object) => void): ITrackerSubscriptionInfo {

      var me = this;

      var subscriptionId: string = uuid.v4();

      var subscription: ITrackerSubscription = {
        active: false,
        initialDataCallback: initialDataCallback,
        onChangeCallback: onChangeCallback
      };

      this.subscriptions[subscriptionId] = subscription;

      function startCallback() {
        var snapshot = me.enableCyclic ? common.data.JSO.dehydrateClone(me.model) : me.model;
        subscription.active = true;
        initialDataCallback({
          version: me.version,
          data: snapshot,
          enableCyclic: me.enableCyclic
        });
      }

      var subscriptionInfo = {
        subscriptionId: subscriptionId,
        startCallback: startCallback
      };

      return subscriptionInfo;
    }


    unsubscribe(subscriptionId: string): void {
      if (this.subscriptions) {
        var subscription = this.subscriptions[subscriptionId];
        //if (!subscription) throw new Error('subscription not found: ' + subscriptionId);
        if (subscription) {
          delete this.subscriptions[subscriptionId];
        }
      }
    }


    destroy(): Promise<void> {
      // stop transmitting changes
      //this.subscriptions = {};
      delete this.subscriptions;
      // close any observers
      this.items.each(function(item, meta: any) {
        if (meta.observer) meta.observer.close();
        delete meta.observer;
      }, this);
      this.items.clear();
      delete this.items;
      return Promise.resolve();
    }


  }


}
