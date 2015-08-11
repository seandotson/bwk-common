module bwk.common.tracking {
  export class TrackerClient<T> {

    connection: common.Connection;
    id: string;
    trackId: string;



    constructor(connection: common.Connection, id: string) {
      this.connection = connection;
      this.id = id;
    }



    init(): Promise<T> {
      var me = this;
      return new Promise<T>(function(resolve, reject) {

        //begin by requesting a trackId
        return me.connection.callRemote('__track_' + me.id + '__')
          .then(function(trackMeta) {

            var trackId = trackMeta.trackId;
            var enableCyclic = trackMeta.enableCyclic;

            var connection = me.connection;

            var version;
            var model;

            // we need the trackId for when we destroy
            me.trackId = trackId;

            // helper functions
            function onBroken() {
              reject(new Error('broken dude'));
            }
            function isRef(item) {
              if (typeof item === 'string' && item.length > 4 && item.substr(0, 4) === 'pth:') {
                return true;
              }
              else {
                return false;
              }
            }
            function deRef(ref) {
              var path = ref.substr(4);
              return evalPath(path);
            }
            function evalPath(path) {
              var node;
              eval('node = model' + path);
              if (!node) throw new Error('cannot eval path: ' + path);
              return node;
            }

            // add event listeners
            connection.on(trackId + '.initial', function(pkg) {

              //console.log(me.id + ': ' + trackId + '.initial', pkg);

              if (pkg.enableCyclic) {
                enableCyclic = true;
                common.data.JSO.hydrateInPlace(pkg.data);
              }
              model = pkg.data;
              version = pkg.version;

              // resolve the big function
              resolve(Promise.resolve(model));

            });

            connection.on(trackId + '.change', function(pkg) {

              //console.log(me.id + ': ' + trackId + '.change', pkg);

              if (pkg.version !== version + 1) {
                onBroken();
                return;
              }

              if (enableCyclic) {
                common.data.JSO.hydrateInPlace(pkg);
              }

              version = pkg.version;

              // implement the change
              var node, i, j, k, splice, spliceArgs, item;

              node = evalPath(pkg.path);

              if (pkg.type === 'array') {

                for (i = 0; i < pkg.splices.length; i++) {
                  splice = pkg.splices[i];

                  // because of the way we have to call splice
                  spliceArgs = splice.added || [];

                  // deref
                  for (j = 0; j < spliceArgs.length; j++) {
                    item = spliceArgs[j];
                    if (isRef(item)) {
                      spliceArgs[j] = deRef(item);
                    }
                  }

                  spliceArgs.unshift(splice.removed.length);
                  spliceArgs.unshift(splice.index);

                  node.splice.apply(node, spliceArgs);

                }

              }
              else if (pkg.type === 'object') {
                // modified
                for (k in pkg.changed) {
                  if (pkg.changed.hasOwnProperty(k)) {
                    item = pkg.changed[k];
                    if (isRef(item)) {
                      item = deRef(item);
                    }
                    node[k] = item;
                  }
                }
                // added
                for (k in pkg.added) {
                  if (pkg.added.hasOwnProperty(k)) {
                    item = pkg.added[k];
                    if (isRef(item)) {
                      item = deRef(item);
                    }
                    node[k] = item;
                  }
                }
                // removed
                for (k in pkg.removed) {
                  if (pkg.removed.hasOwnProperty(k)) {
                    item = pkg.removed[k];
                    delete node[k];
                  }
                }
              }


            });

            // now call start
            return me.connection.callRemote('__trackstart_' + trackId + '__');
          });


      });
    }


    destroy(): Promise<void> {
      if (this.connection) {
        // remove listeners
        this.connection.un(this.trackId + '.initial');
        this.connection.un(this.trackId + '.change');
        delete this.connection;
      }
      return Promise.resolve();
    }

  }
}
