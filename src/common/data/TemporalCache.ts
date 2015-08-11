
module bwk.common.data {


  export class TemporalCache {


    //defaultTimeout: number = 10000;
    timeoutHeartbeat: number = 200;
    heartbeatIntervalId: any;

    ticketLookup: Object;
    ticketTimeoutQueue: Array<Object>;

    // a function that produces unique ids. must be passed in to the constructor
    uuid: () => string;

    constructor(uuidFn: () => string) {
      this.uuid = uuidFn;
      this.ticketLookup = {};
      this.ticketTimeoutQueue = [];
      if (this.timeoutHeartbeat && this.timeoutHeartbeat > 0) {
        this.heartbeatIntervalId = setInterval(this.bind(function() {
          this.clearTimeouts();
        }), this.timeoutHeartbeat);
      }
    }

    destroy() {
      if (this.heartbeatIntervalId) {
        clearInterval(this.heartbeatIntervalId);
        this.heartbeatIntervalId = null;
      }
    }

    newTicket(item, timeout, listeners?) {
      var ticket = this.uuid();
      this.add(ticket, item, timeout, listeners);
      return ticket;
    }

    addMilliseconds(date, milliseconds) {
      var result = new Date(date);
      result.setMilliseconds(result.getMilliseconds() + milliseconds);
      return result;
    }

    add(ticket, item, timeout, listeners) {
      if (typeof timeout === 'undefined') {
        //timeout = this.defaultTimeout;
        throw 'timeout required';
      }
      if (this.ticketLookup[ticket]) {
        throw 'duplicate key: ' + ticket;
      }
      var now = new Date(),
        pkg = {
          ticket: ticket,
          added: now,
          timeout: timeout,
          expires: this.addMilliseconds(now, timeout),
          item: item,
          listeners: listeners
        };
      this.ticketLookup[ticket] = pkg;
      this.ticketTimeoutQueue.push(pkg);
      this.ticketTimeoutQueue.sort(this.compareExpires);
      return pkg;
    }

    compareExpires(pkg1, pkg2) {
      var expires1 = pkg1.expires,
        expires2 = pkg2.expires;
      if (expires1 === expires2) {
        return 0;
      } else {
        if (expires1 > expires2) {
          return 1;
        } else {
          return -1;
        }
      }
    }

    getPkg(ticket, now?) {
      // gets item, checks timeout, refreshes timeout, returns item
      now = now || Date.now();
      var pkg = this.ticketLookup[ticket];
      if (pkg) {
        // check expired
        if (pkg.expires < now) {
          // might as well clear all timeouts
          this.clearTimeouts(now);
          return null;
        } else {
          return pkg;
        }
      } else {
        return null;
      }
    }

    fireEvent(pkg, event) {
      if (pkg && pkg.listeners && pkg.listeners[event]) {
        var scope = pkg.listeners.scope || pkg.scope || pkg.item;
        pkg.listeners[event].call(scope, event, pkg.item);
      }
    }

    clearTimeouts(now?) {
      // todo, this could be more efficient
      now = now || Date.now();
      var queue = this.ticketTimeoutQueue,
        ticket, pkg;
      while (queue.length && queue[0]['expires'] <= now) {
        pkg = queue.shift();
        ticket = pkg.ticket;
        // remove pkg from lookup
        delete this.ticketLookup[ticket];
        this.fireEvent(pkg, 'timeout');
      }
    }

    removePkg(pkg) {
      var index = this.ticketTimeoutQueue.indexOf(pkg);
      if (index > -1) {
        this.ticketTimeoutQueue.splice(index, 1);
        delete this.ticketLookup[pkg.ticket];
        this.fireEvent(pkg, 'remove');
      }
    }

    pull(ticket, now?) {
      // gets item, checks timeout, removes item, returns item
      now = now || Date.now();
      var pkg = this.getPkg(ticket, now);
      if (pkg) {
        this.removePkg(pkg);
        this.fireEvent(pkg, 'pull');
        return pkg.item;
      } else {
        return null;
      }
    }

    peek(ticket, now?) {
      // gets item, checks timeout, returns item
      now = now || Date.now();
      var pkg = this.getPkg(ticket, now);
      if (pkg) {
        this.fireEvent(pkg, 'peek');
        return pkg.item;
      } else {
        return null;
      }
    }

    refresh(ticket, now?) {
      // gets item, checks timeout, refreshes timeout, returns item
      now = now || Date.now();
      var pkg = this.getPkg(ticket, now);
      if (pkg) {
        pkg.expires = this.addMilliseconds(now, pkg.timeout);
        this.ticketTimeoutQueue.sort(this.compareExpires);
        this.fireEvent(pkg, 'refresh');
        return pkg.item;
      } else {
        return null;
      }
    }

    bind(fn) {
      var me = this;
      return function() {
        fn.apply(me, arguments);
      };
    }

    getOutstandingTicketCount() {
      return this.ticketTimeoutQueue.length;
    }


  }


}
