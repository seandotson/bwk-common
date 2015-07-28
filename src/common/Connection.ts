module common {
  export class Connection {

    socket: any;
    listeners: Object;
    exposedMethods: Object;
    calls: common.data.TemporalCache;

    isConnected: boolean;


    constructor(socket: any) {

      var me = this;

      this.socket = socket;
      this.listeners = {};
      this.exposedMethods = {};

      var nextCallId: number = 100;
      function getNextCallId() {
        nextCallId += 1;
        return 'c' + nextCallId;
      }

      this.calls = new common.data.TemporalCache(getNextCallId);
      this.isConnected = socket.readyState === 'open';

      socket.on('open', function() {
        me.isConnected = true;
      });
      socket.on('close', function() {
        me.isConnected = false;
      });
      // handle message handling as events
      socket.on('message', function(msgString) {
        var msg, event, handler;
        try {
          msg = JSON.parse(msgString);
        }
        catch (err) {
          console.log('invalid message json')
          return;
        }
        handler = me.listeners[msg.event];
        if (handler) {
          handler.call(me, msg.data);
        }
      });

      // enable remote method calls
      // listen for incoming method calls
      this.on('methodCall', function(msg) {
        var exposed = me.exposedMethods[msg.method];
        if (!exposed) {
          // todo handle failure
          console.log('method not exposed: ' + msg.method);
          return;
        }

        var args;
        if (exposed.prependSocket) {
          args = msg.args.slice(0);
          args.unshift(me);
        }
        else {
          args = msg.args;
        }
        exposed.fn.apply(exposed.scope, args)
          .then(function(data) {
            me.emit('methodResult', {
              ticket: msg.ticket,
              data: data
            });
          })
          .catch(function(err) {
            // todo
            console.log('error', err);
          });
      });

      // listen for incoming method results
      me.on('methodResult', function(result) {
        var item = me.calls.pull(result.ticket);
        if (item) {
          item.resolve(Promise.resolve(result.data));
        }
      });

    }

    getId(): string {
      return this.socket.id;
    }

    send(data: string): void {
      this.socket.send(data);
    }

    emit(event: string, data: Object): void {
      this.socket.send(JSON.stringify({
        event: event,
        data: data
      }));
    }

    on(event: string, handler: (data?: any) => void, scope?: Object): void {
      if (scope) {
        var innerHandler = handler;
        handler = function() {
          return innerHandler.apply(scope, arguments);
        };
      }

      if (event === 'close') {
        this.socket.on('close', handler);
      }
      else {
        this.listeners[event] = handler;
      }
    }

    un(event: string): void {
      this.listeners[event] = null;
    }

    expose(fnName: string, fn: Function, scope?: Object, prependSocket?: boolean): void {
      if (this.exposedMethods[fnName]) throw new Error('Duplicate exposed method: ' + fnName);
      this.exposedMethods[fnName] = {
        fn: fn,
        scope: scope,
        prependSocket: prependSocket
      };
    }

    unexpose(fnName: string): void {
      if (!this.exposedMethods[fnName]) throw new Error('Missing exposed method: ' + fnName);
      delete this.exposedMethods[fnName];
    }

    callRemote(method: string, args?: Array<any>, timeout?: number): Promise<any> {
      var me = this;
      return new Promise<any>(function(resolve, reject) {

        timeout = timeout || 10000;   // 10 seconds by default

        args = args || [];

        var msg = {
          method: method,
          args: args,
          timeout: timeout,
          resolve: resolve,
          reject: reject,
          ticket: null
        };

        msg.ticket = me.calls.newTicket(msg, timeout);

        me.emit('methodCall', msg);

        if (timeout) {

        }
      });
    }

    hasMethod(method: string) {
      return this.exposedMethods[method] !== undefined;
    }

  }
}
