module bwk.common.tracking {
  export class TrackerServer<T> {

    tracker: Tracker;
    id: string;
    model: T;
    enableCyclic: boolean;

    initialized: boolean;


    constructor(id: string, model: T, enableCyclic: boolean) {
      this.id = id;
      this.model = model;
      this.enableCyclic = enableCyclic;
      this.tracker = new Tracker(this.model, this.enableCyclic);
    }

    subscribe(connection: common.Connection): Promise<void> {
      var me = this;
      return new Promise<void>(function(resolve, reject) {

        var trackId;

        connection.on('close', onDisconnect);

        function onDisconnect() {
          if (me.tracker) {
            me.tracker.unsubscribe(trackId);
          }
        }

        function onInitialData(data) {
          connection.emit(trackId + '.initial', data);
        }

        function onChange(change) {
          connection.emit(trackId + '.change', change);
        }

        var subscription;

        // expose methods to allow remote client to start things off
        function getTrackId() {
          subscription = me.tracker.subscribe(onInitialData, onChange);
          trackId = subscription.subscriptionId;
          connection.expose('__trackstart_' + trackId + '__', startTracking, me, false);
          connection.expose('__trackstop_' + trackId + '__', stopTracking, me, false);
          return Promise.resolve({
            enableCyclic: me.enableCyclic,
            trackId: trackId
          });
        }

        function startTracking() {
          subscription.startCallback();
          return Promise.resolve();
        }
        function stopTracking() {
          me.tracker.unsubscribe(trackId);
          return Promise.resolve();
        }

        connection.expose('__track_' + me.id + '__', getTrackId, me, false);

        resolve(Promise.resolve());

      });
    }

    destroy(): Promise<void> {
      var me = this;
      return this.tracker.destroy()
        .then(function() {
          delete me.model;
          delete me.tracker;
          return Promise.resolve();
        });
    }

  }
}
