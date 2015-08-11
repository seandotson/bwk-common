//var JSON1 = JSON;
var JSON2 = (function () {
    function JSON2() {
    }
    return JSON2;
})();
//(function(JSON){
/*
    cycle.js
    2013-02-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/
/*jslint evil: true, regexp: true */
/*members $ref, apply, call, decycle, hasOwnProperty, length, prototype, push,
    retrocycle, stringify, test, toString
*/
if (typeof JSON2.decycle !== 'function') {
    JSON2.decycle = function decycle(object) {
        'use strict';
        // Make a deep copy of an object or array, assuring that there is at most
        // one instance of each object or array in the resulting structure. The
        // duplicate references (which might be forming cycles) are replaced with
        // an object of the form
        //      {$ref: PATH}
        // where the PATH is a JSONPath string that locates the first occurance.
        // So,
        //      var a = [];
        //      a[0] = a;
        //      return JSON.stringify(JSON2.decycle(a));
        // produces the string '[{"$ref":"$"}]'.
        // JSONPath is used to locate the unique object. $ indicates the top level of
        // the object or array. [NUMBER] or [STRING] indicates a child member or
        // property.
        var objects = [], paths = []; // Keep the path to each unique object or array
        return (function derez(value, path) {
            // The derez recurses through the object, producing the deep copy.
            var i, name, nu; // The new object or array
            // typeof null === 'object', so go on if this value is really an object but not
            // one of the weird builtin objects.
            if (typeof value === 'object' && value !== null &&
                !(value instanceof Boolean) &&
                !(value instanceof Date) &&
                !(value instanceof Number) &&
                !(value instanceof RegExp) &&
                !(value instanceof String)) {
                // If the value is an object or array, look to see if we have already
                // encountered it. If so, return a $ref/path object. This is a hard way,
                // linear search that will get slower as the number of unique objects grows.
                for (i = 0; i < objects.length; i += 1) {
                    if (objects[i] === value) {
                        return { $ref: paths[i] };
                    }
                }
                // Otherwise, accumulate the unique value and its path.
                objects.push(value);
                paths.push(path);
                // If it is an array, replicate the array.
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    nu = [];
                    for (i = 0; i < value.length; i += 1) {
                        nu[i] = derez(value[i], path + '[' + i + ']');
                    }
                }
                else {
                    // If it is an object, replicate the object.
                    nu = {};
                    for (name in value) {
                        if (Object.prototype.hasOwnProperty.call(value, name)) {
                            nu[name] = derez(value[name], path + '[' + JSON.stringify(name) + ']');
                        }
                    }
                }
                return nu;
            }
            return value;
        }(object, '$'));
    };
}
if (typeof JSON2.retrocycle !== 'function') {
    JSON2.retrocycle = function retrocycle($) {
        'use strict';
        // Restore an object that was reduced by decycle. Members whose values are
        // objects of the form
        //      {$ref: PATH}
        // are replaced with references to the value found by the PATH. This will
        // restore cycles. The object will be mutated.
        // The eval function is used to locate the values described by a PATH. The
        // root object is kept in a $ variable. A regular expression is used to
        // assure that the PATH is extremely well formed. The regexp contains nested
        // * quantifiers. That has been known to have extremely bad performance
        // problems on some browsers for very long strings. A PATH is expected to be
        // reasonably short. A PATH is allowed to belong to a very restricted subset of
        // Goessner's JSONPath.
        // So,
        //      var s = '[{"$ref":"$"}]';
        //      return JSON.retrocycle(JSON.parse(s));
        // produces an array containing a single element which is the array itself.
        var px = /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;
        (function rez(value) {
            // The rez function walks recursively through the object looking for $ref
            // properties. When it finds one that has a value that is a path, then it
            // replaces the $ref object with a reference to the value that is found by
            // the path.
            var i, item, name, path;
            if (value && typeof value === 'object') {
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    for (i = 0; i < value.length; i += 1) {
                        item = value[i];
                        if (item && typeof item === 'object') {
                            path = item.$ref;
                            if (typeof path === 'string' && px.test(path)) {
                                value[i] = eval(path);
                            }
                            else {
                                rez(item);
                            }
                        }
                    }
                }
                else {
                    for (name in value) {
                        if (typeof value[name] === 'object') {
                            item = value[name];
                            if (item) {
                                path = item.$ref;
                                if (typeof path === 'string' && px.test(path)) {
                                    value[name] = eval(path);
                                }
                                else {
                                    rez(item);
                                }
                            }
                        }
                    }
                }
            }
        }($));
        return $;
    };
}
//})(JSON2);
var bwk;
(function (bwk) {
    var common;
    (function (common) {
        var Util = (function () {
            function Util() {
            }
            Util.arrayify = function (item, keyProp) {
                var key, value, result = [];
                if (item) {
                    for (key in item) {
                        if (item.hasOwnProperty(key)) {
                            value = item[key];
                            if (typeof value === 'object') {
                                if (keyProp) {
                                    value[keyProp] = key;
                                }
                                result.push(value);
                            }
                        }
                    }
                }
                return result;
            };
            Util.each = function (list, fn, scope) {
                var i, item, value, length;
                if (list && list.length) {
                    length = list.length;
                    for (i = 0; i < length; i++) {
                        item = list[i];
                        if (item) {
                            value = fn.call(scope, item, i, list);
                            if (value === false) {
                                break;
                            }
                        }
                    }
                }
            };
            Util.apply = function (o1, o2) {
                var key;
                if (o1 && o2) {
                    for (key in o2) {
                        if (o2.hasOwnProperty(key)) {
                            o1[key] = o2[key];
                        }
                    }
                }
                return o1;
            };
            return Util;
        })();
    })(common = bwk.common || (bwk.common = {}));
})(bwk || (bwk = {}));
/// <reference path="../Cycle.ts"/>
var bwk;
(function (bwk) {
    var common;
    (function (common) {
        var data;
        (function (data) {
            var JSOOptions = (function () {
                function JSOOptions(config) {
                    this.cyclic = true;
                    this.shorthand = false;
                    this.functions = true;
                    this.dates = true;
                    this.regex = false;
                    this.strict = false;
                    if (config) {
                        this.applyBoolean(config, 'cyclic');
                        this.applyBoolean(config, 'shorthand');
                        this.applyBoolean(config, 'functions');
                        this.applyBoolean(config, 'dates');
                        this.applyBoolean(config, 'regex');
                        this.applyBoolean(config, 'strict');
                    }
                }
                JSOOptions.prototype.applyBoolean = function (config, name) {
                    var value = config[name];
                    switch (typeof value) {
                        case 'boolean':
                            this[name] = value;
                            break;
                    }
                };
                JSOOptions.prototype.isComplex = function () {
                    return this.functions || this.dates || this.regex;
                };
                return JSOOptions;
            })();
            data.JSOOptions = JSOOptions;
            var JSO = (function () {
                function JSO() {
                }
                JSO.serialize = function (obj, opt) {
                    // grab options
                    var options = new JSOOptions(opt), serial;
                    if (options.strict) {
                        return JSON.stringify(obj);
                    }
                    else {
                        // decycle to turn loops into references
                        if (options.cyclic) {
                            JSON2.decycle(obj);
                            if (options.shorthand) {
                                JSO.encodeShorthand(obj);
                            }
                        }
                        if (options.dates) {
                            JSO.encodeDates(obj);
                        }
                        // serialize
                        if (options.isComplex()) {
                            //console.log('todo: serialize with functions')
                            serial = JSON.stringify(obj);
                        }
                        else {
                            // simple stringify will do
                            serial = JSON.stringify(obj);
                        }
                    }
                    return serial;
                };
                JSO.deserialize = function (serial, opt) {
                    // grab options
                    var options = new JSOOptions(opt), obj;
                    if (options.strict) {
                        return JSON.parse(serial);
                    }
                    else {
                        // eval aka parse
                        try {
                            eval('obj = ' + serial + ';');
                        }
                        catch (err) {
                            throw err;
                        }
                        if (!obj) {
                            throw 'unable to deserialize';
                        }
                        // decode shorthand
                        if (options.shorthand) {
                            JSO.decodeShorthand(obj);
                        }
                        if (options.dates) {
                            JSO.decodeDates(obj);
                        }
                        // hydrate to add back the loops
                        JSON2.retrocycle(obj);
                        return obj;
                    }
                };
                // public aliases
                JSO.hydrateInPlace = function (item, opt) {
                    var options = new JSOOptions(opt);
                    if (options.dates)
                        JSO.decodeDates(item);
                    if (options.shorthand)
                        JSO.decodeShorthand(item);
                    // hydrate to add back the loops
                    JSON2.retrocycle(item);
                };
                JSO.dehydrateClone = function (item, opt) {
                    var options = new JSOOptions(opt);
                    var clone = JSON2.decycle(item);
                    if (options.shorthand)
                        JSO.encodeShorthand(clone);
                    if (options.dates)
                        JSO.encodeDates(clone);
                    return clone;
                };
                JSO.encodeDates = function (item) {
                    // convert Date to 'date:Sun Mar 08 2015 19:13:57 GMT-0400 (EDT)'
                    return JSO.walkTreeReplace(item, undefined, 0, function (value) {
                        return value instanceof Date && !isNaN(value.valueOf());
                    }, function (value, parent, qualifier) {
                        return 'date:' + value;
                    });
                };
                JSO.decodeDates = function (item) {
                    // convert 'date:Sun Mar 08 2015 19:13:57 GMT-0400 (EDT)' to Date
                    return JSO.walkTreeReplace(item, undefined, 0, function (value) {
                        return typeof value === 'string' && value.length > 20 && value.substr(0, 5) === 'date:';
                    }, function (value, parent, qualifier) {
                        return new Date(value.substr(5));
                    });
                };
                JSO.encodeShorthand = function (item) {
                    // convert {$ref:'$["app"]["sala-nz-monitor"]'} to 'ref:app.sala-nz-monitor'
                    return JSO.walkTreeReplace(item, undefined, 0, function (value) {
                        return typeof value === 'object' && value['$ref'];
                    }, function (value, parent, qualifier) {
                        var str = value['$ref'];
                        str = str
                            .replace(/\$\["/g, '')
                            .replace(/"\]\["/g, '.')
                            .replace(/"\]/g, '');
                        return 'ref:' + str;
                    });
                };
                JSO.decodeShorthand = function (item) {
                    // convert 'ref:app.sala-nz-monitor' to {$ref:'$["app"]["sala-nz-monitor"]'}
                    return JSO.walkTreeReplace(item, undefined, 0, function (value) {
                        return typeof value === 'string' && value.length > 4 && value.substr(0, 4) === 'ref:';
                    }, function (value, parent, qualifier) {
                        var tokens = value.split(':')[1].split('.');
                        return {
                            '$ref': '$["' + tokens.join('"]["') + '"]'
                        };
                    });
                };
                JSO.walkTreeReplace = function (parent, qualifier, count, filter, convert) {
                    var i, k, value, hasValue;
                    if (qualifier === undefined) {
                        value = parent;
                    }
                    else {
                        hasValue = true;
                        value = parent[qualifier];
                    }
                    if (hasValue && filter(value)) {
                        count += 1;
                        parent[qualifier] = convert(value, parent, qualifier);
                    }
                    else {
                        if (value instanceof Array) {
                            for (i = 0; i < value.length; i++) {
                                count = JSO.walkTreeReplace(value, i, count, filter, convert);
                            }
                        }
                        else {
                            if (typeof value === 'object') {
                                for (k in value) {
                                    if (value.hasOwnProperty(k)) {
                                        count = JSO.walkTreeReplace(value, k, count, filter, convert);
                                    }
                                }
                            }
                        }
                    }
                    return count;
                };
                return JSO;
            })();
            data.JSO = JSO;
        })(data = common.data || (common.data = {}));
    })(common = bwk.common || (bwk.common = {}));
})(bwk || (bwk = {}));
var bwk;
(function (bwk) {
    var common;
    (function (common) {
        var data;
        (function (data) {
            var ObjectMap = (function () {
                function ObjectMap() {
                    this.keyList = [];
                    this.lookup = {};
                }
                ObjectMap.nextId = function () {
                    ObjectMap.counter += 1;
                    return 'o' + String(ObjectMap.counter);
                };
                ObjectMap.getId = function (obj) {
                    if (!obj[ObjectMap.getIdFnName]) {
                        var id = ObjectMap.nextId();
                        obj[ObjectMap.getIdFnName] = function () {
                            return id;
                        };
                    }
                    return obj[ObjectMap.getIdFnName]();
                };
                ObjectMap.prototype.add = function (obj, value) {
                    if (typeof obj !== 'object')
                        throw new Error('key must be an object: ' + (typeof obj));
                    var id = ObjectMap.getId(obj);
                    if (this.lookup[id] !== undefined)
                        throw new Error('duplicate object key');
                    this.lookup[id] = value;
                    this.keyList.push(obj);
                };
                ObjectMap.prototype.remove = function (obj) {
                    if (!this.containsKey(obj))
                        throw new Error('key not found');
                    var keyIndex = this.keyList.indexOf(obj);
                    if (keyIndex === -1)
                        throw new Error('key not found using indexOf');
                    this.keyList.splice(keyIndex, 1);
                    var id = obj[ObjectMap.getIdFnName]();
                    delete this.lookup[id];
                };
                ObjectMap.prototype.get = function (obj) {
                    if (!this.containsKey(obj))
                        throw new Error('key not found');
                    var id = obj[ObjectMap.getIdFnName]();
                    return this.lookup[id];
                };
                ObjectMap.prototype.containsKey = function (obj) {
                    if (obj[ObjectMap.getIdFnName]) {
                        var id = obj[ObjectMap.getIdFnName]();
                        return this.lookup[id] !== undefined;
                    }
                    else {
                        return false;
                    }
                };
                ObjectMap.prototype.each = function (fn, scope) {
                    var key, i;
                    for (i = 0; i < this.keyList.length; i++) {
                        key = this.keyList[i];
                        fn.call(scope, key, this.lookup[key[ObjectMap.getIdFnName]()]);
                    }
                };
                ObjectMap.prototype.clear = function () {
                    this.keyList = [];
                    this.lookup = {};
                };
                ObjectMap.getIdFnName = '__getId__';
                ObjectMap.counter = 0;
                return ObjectMap;
            })();
            data.ObjectMap = ObjectMap;
        })(data = common.data || (common.data = {}));
    })(common = bwk.common || (bwk.common = {}));
})(bwk || (bwk = {}));
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
var bwk;
(function (bwk) {
    var common;
    (function (common) {
        var data;
        (function (data) {
            var TemporalCache = (function () {
                function TemporalCache(uuidFn) {
                    //defaultTimeout: number = 10000;
                    this.timeoutHeartbeat = 200;
                    this.uuid = uuidFn;
                    this.ticketLookup = {};
                    this.ticketTimeoutQueue = [];
                    if (this.timeoutHeartbeat && this.timeoutHeartbeat > 0) {
                        this.heartbeatIntervalId = setInterval(this.bind(function () {
                            this.clearTimeouts();
                        }), this.timeoutHeartbeat);
                    }
                }
                TemporalCache.prototype.destroy = function () {
                    if (this.heartbeatIntervalId) {
                        clearInterval(this.heartbeatIntervalId);
                        this.heartbeatIntervalId = null;
                    }
                };
                TemporalCache.prototype.newTicket = function (item, timeout, listeners) {
                    var ticket = this.uuid();
                    this.add(ticket, item, timeout, listeners);
                    return ticket;
                };
                TemporalCache.prototype.addMilliseconds = function (date, milliseconds) {
                    var result = new Date(date);
                    result.setMilliseconds(result.getMilliseconds() + milliseconds);
                    return result;
                };
                TemporalCache.prototype.add = function (ticket, item, timeout, listeners) {
                    if (typeof timeout === 'undefined') {
                        //timeout = this.defaultTimeout;
                        throw 'timeout required';
                    }
                    if (this.ticketLookup[ticket]) {
                        throw 'duplicate key: ' + ticket;
                    }
                    var now = new Date(), pkg = {
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
                };
                TemporalCache.prototype.compareExpires = function (pkg1, pkg2) {
                    var expires1 = pkg1.expires, expires2 = pkg2.expires;
                    if (expires1 === expires2) {
                        return 0;
                    }
                    else {
                        if (expires1 > expires2) {
                            return 1;
                        }
                        else {
                            return -1;
                        }
                    }
                };
                TemporalCache.prototype.getPkg = function (ticket, now) {
                    // gets item, checks timeout, refreshes timeout, returns item
                    now = now || Date.now();
                    var pkg = this.ticketLookup[ticket];
                    if (pkg) {
                        // check expired
                        if (pkg.expires < now) {
                            // might as well clear all timeouts
                            this.clearTimeouts(now);
                            return null;
                        }
                        else {
                            return pkg;
                        }
                    }
                    else {
                        return null;
                    }
                };
                TemporalCache.prototype.fireEvent = function (pkg, event) {
                    if (pkg && pkg.listeners && pkg.listeners[event]) {
                        var scope = pkg.listeners.scope || pkg.scope || pkg.item;
                        pkg.listeners[event].call(scope, event, pkg.item);
                    }
                };
                TemporalCache.prototype.clearTimeouts = function (now) {
                    // todo, this could be more efficient
                    now = now || Date.now();
                    var queue = this.ticketTimeoutQueue, ticket, pkg;
                    while (queue.length && queue[0]['expires'] <= now) {
                        pkg = queue.shift();
                        ticket = pkg.ticket;
                        // remove pkg from lookup
                        delete this.ticketLookup[ticket];
                        this.fireEvent(pkg, 'timeout');
                    }
                };
                TemporalCache.prototype.removePkg = function (pkg) {
                    var index = this.ticketTimeoutQueue.indexOf(pkg);
                    if (index > -1) {
                        this.ticketTimeoutQueue.splice(index, 1);
                        delete this.ticketLookup[pkg.ticket];
                        this.fireEvent(pkg, 'remove');
                    }
                };
                TemporalCache.prototype.pull = function (ticket, now) {
                    // gets item, checks timeout, removes item, returns item
                    now = now || Date.now();
                    var pkg = this.getPkg(ticket, now);
                    if (pkg) {
                        this.removePkg(pkg);
                        this.fireEvent(pkg, 'pull');
                        return pkg.item;
                    }
                    else {
                        return null;
                    }
                };
                TemporalCache.prototype.peek = function (ticket, now) {
                    // gets item, checks timeout, returns item
                    now = now || Date.now();
                    var pkg = this.getPkg(ticket, now);
                    if (pkg) {
                        this.fireEvent(pkg, 'peek');
                        return pkg.item;
                    }
                    else {
                        return null;
                    }
                };
                TemporalCache.prototype.refresh = function (ticket, now) {
                    // gets item, checks timeout, refreshes timeout, returns item
                    now = now || Date.now();
                    var pkg = this.getPkg(ticket, now);
                    if (pkg) {
                        pkg.expires = this.addMilliseconds(now, pkg.timeout);
                        this.ticketTimeoutQueue.sort(this.compareExpires);
                        this.fireEvent(pkg, 'refresh');
                        return pkg.item;
                    }
                    else {
                        return null;
                    }
                };
                TemporalCache.prototype.bind = function (fn) {
                    var me = this;
                    return function () {
                        fn.apply(me, arguments);
                    };
                };
                TemporalCache.prototype.getOutstandingTicketCount = function () {
                    return this.ticketTimeoutQueue.length;
                };
                return TemporalCache;
            })();
            data.TemporalCache = TemporalCache;
        })(data = common.data || (common.data = {}));
    })(common = bwk.common || (bwk.common = {}));
})(bwk || (bwk = {}));
/// <reference path="JSO.ts"/>
/// <reference path="ObjectMap.ts"/>
//  / <reference path="Randy.ts"/>
/// <reference path="TemporalCache.ts"/>
/// <reference path="IAcceleration.ts"/>
/// <reference path="IClientSession.ts"/>
/// <reference path="IGeoCoords.ts"/>
/// <reference path="IGroupModel.ts"/>
/// <reference path="ILocation.ts"/>
/// <reference path="IPublicSession.ts"/>
/// <reference path="IRotation.ts"/>
/// <reference path="IServerSession.ts"/>
var bwk;
(function (bwk) {
    var common;
    (function (common) {
        var tracking;
        (function (tracking) {
            var Tracker = (function () {
                function Tracker(model, enableCyclic) {
                    var me = this;
                    this.enableCyclic = enableCyclic;
                    this.model = model;
                    this.version = 1;
                    this.subscriptions = {};
                    var items = new common.data.ObjectMap();
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
                                    meta.observer.open(function (splices) {
                                        handleArrayChange(item, path, splices);
                                    });
                                }
                                else {
                                    meta.observer = new ObjectObserver(item);
                                    meta.observer.open(function (added, removed, changed, getOldValueFn) {
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
                Tracker.prototype.subscribe = function (initialDataCallback, onChangeCallback) {
                    var me = this;
                    var subscriptionId = uuid.v4();
                    var subscription = {
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
                };
                Tracker.prototype.unsubscribe = function (subscriptionId) {
                    if (this.subscriptions) {
                        var subscription = this.subscriptions[subscriptionId];
                        //if (!subscription) throw new Error('subscription not found: ' + subscriptionId);
                        if (subscription) {
                            delete this.subscriptions[subscriptionId];
                        }
                    }
                };
                Tracker.prototype.destroy = function () {
                    // stop transmitting changes
                    //this.subscriptions = {};
                    delete this.subscriptions;
                    // close any observers
                    this.items.each(function (item, meta) {
                        if (meta.observer)
                            meta.observer.close();
                        delete meta.observer;
                    }, this);
                    this.items.clear();
                    delete this.items;
                    return Promise.resolve();
                };
                return Tracker;
            })();
            tracking.Tracker = Tracker;
        })(tracking = common.tracking || (common.tracking = {}));
    })(common = bwk.common || (bwk.common = {}));
})(bwk || (bwk = {}));
var bwk;
(function (bwk) {
    var common;
    (function (common) {
        var tracking;
        (function (tracking) {
            var TrackerClient = (function () {
                function TrackerClient(connection, id) {
                    this.connection = connection;
                    this.id = id;
                }
                TrackerClient.prototype.init = function () {
                    var me = this;
                    return new Promise(function (resolve, reject) {
                        //begin by requesting a trackId
                        return me.connection.callRemote('__track_' + me.id + '__')
                            .then(function (trackMeta) {
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
                                if (!node)
                                    throw new Error('cannot eval path: ' + path);
                                return node;
                            }
                            // add event listeners
                            connection.on(trackId + '.initial', function (pkg) {
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
                            connection.on(trackId + '.change', function (pkg) {
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
                };
                TrackerClient.prototype.destroy = function () {
                    if (this.connection) {
                        // remove listeners
                        this.connection.un(this.trackId + '.initial');
                        this.connection.un(this.trackId + '.change');
                        delete this.connection;
                    }
                    return Promise.resolve();
                };
                return TrackerClient;
            })();
            tracking.TrackerClient = TrackerClient;
        })(tracking = common.tracking || (common.tracking = {}));
    })(common = bwk.common || (bwk.common = {}));
})(bwk || (bwk = {}));
var bwk;
(function (bwk) {
    var common;
    (function (common) {
        var tracking;
        (function (tracking) {
            var TrackerServer = (function () {
                function TrackerServer(id, model, enableCyclic) {
                    this.id = id;
                    this.model = model;
                    this.enableCyclic = enableCyclic;
                    this.tracker = new tracking.Tracker(this.model, this.enableCyclic);
                }
                TrackerServer.prototype.subscribe = function (connection) {
                    var me = this;
                    return new Promise(function (resolve, reject) {
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
                };
                TrackerServer.prototype.destroy = function () {
                    var me = this;
                    return this.tracker.destroy()
                        .then(function () {
                        delete me.model;
                        delete me.tracker;
                        return Promise.resolve();
                    });
                };
                return TrackerServer;
            })();
            tracking.TrackerServer = TrackerServer;
        })(tracking = common.tracking || (common.tracking = {}));
    })(common = bwk.common || (bwk.common = {}));
})(bwk || (bwk = {}));
/// <reference path="ITrackerSubscription.ts"/>
/// <reference path="ITrackerSubscriptionInfo.ts"/>
/// <reference path="Tracker.ts"/>
/// <reference path="TrackerClient.ts"/>
/// <reference path="TrackerServer.ts"/>
var bwk;
(function (bwk) {
    var common;
    (function (common) {
        var Application = (function () {
            function Application() {
            }
            //managers: { [id: string]: Manager };
            //constructor() {
            //  this.managers = {};
            //}
            Application.prototype.init = function () {
                //return this.callManagersSequence('init');
                //console.log('base application init');
                return Promise.resolve();
            };
            /*
                addManager(name: string, manager: Manager): Application {
                  this.managers[name] = manager;
                  return this;
                }
        
                getManager(name: string): Manager {
                  return this.managers[name];
                }
                */
            Application.prototype.callSequence = function (promises) {
                var me = this;
                if (promises.length) {
                    var promise = promises.shift();
                    return Promise.resolve(promise)
                        .then(function () {
                        return me.callSequence(promises);
                    });
                }
                else {
                    return Promise.resolve();
                }
            };
            return Application;
        })();
        common.Application = Application;
    })(common = bwk.common || (bwk.common = {}));
})(bwk || (bwk = {}));
var bwk;
(function (bwk) {
    var common;
    (function (common) {
        var Connection = (function () {
            function Connection(socket) {
                var me = this;
                this.socket = socket;
                this.listeners = {};
                this.exposedMethods = {};
                var nextCallId = 100;
                function getNextCallId() {
                    nextCallId += 1;
                    return 'c' + nextCallId;
                }
                this.calls = new common.data.TemporalCache(getNextCallId);
                this.isConnected = socket.readyState === 'open';
                socket.on('open', function () {
                    me.isConnected = true;
                });
                socket.on('close', function () {
                    me.isConnected = false;
                });
                // handle message handling as events
                socket.on('message', function (msgString) {
                    var msg, event, handler;
                    try {
                        msg = JSON.parse(msgString);
                    }
                    catch (err) {
                        console.log('invalid message json');
                        return;
                    }
                    handler = me.listeners[msg.event];
                    if (handler) {
                        handler.call(me, msg.data);
                    }
                });
                // enable remote method calls
                // listen for incoming method calls
                this.on('methodCall', function (msg) {
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
                        .then(function (data) {
                        me.emit('methodResult', {
                            ticket: msg.ticket,
                            data: data
                        });
                    })
                        .catch(function (err) {
                        // todo
                        console.log('error', err);
                    });
                });
                // listen for incoming method results
                me.on('methodResult', function (result) {
                    var item = me.calls.pull(result.ticket);
                    if (item) {
                        item.resolve(Promise.resolve(result.data));
                    }
                });
            }
            Connection.prototype.getId = function () {
                return this.socket.id;
            };
            Connection.prototype.send = function (data) {
                this.socket.send(data);
            };
            Connection.prototype.emit = function (event, data) {
                this.socket.send(JSON.stringify({
                    event: event,
                    data: data
                }));
            };
            Connection.prototype.on = function (event, handler, scope) {
                if (scope) {
                    var innerHandler = handler;
                    handler = function () {
                        return innerHandler.apply(scope, arguments);
                    };
                }
                if (event === 'close') {
                    this.socket.on('close', handler);
                }
                else {
                    this.listeners[event] = handler;
                }
            };
            Connection.prototype.un = function (event) {
                this.listeners[event] = null;
            };
            Connection.prototype.expose = function (fnName, fn, scope, prependSocket) {
                if (this.exposedMethods[fnName])
                    throw new Error('Duplicate exposed method: ' + fnName);
                this.exposedMethods[fnName] = {
                    fn: fn,
                    scope: scope,
                    prependSocket: prependSocket
                };
            };
            Connection.prototype.unexpose = function (fnName) {
                if (!this.exposedMethods[fnName])
                    throw new Error('Missing exposed method: ' + fnName);
                delete this.exposedMethods[fnName];
            };
            Connection.prototype.callRemote = function (method, args, timeout) {
                var me = this;
                return new Promise(function (resolve, reject) {
                    timeout = timeout || 10000; // 10 seconds by default
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
            };
            Connection.prototype.hasMethod = function (method) {
                return this.exposedMethods[method] !== undefined;
            };
            return Connection;
        })();
        common.Connection = Connection;
    })(common = bwk.common || (bwk.common = {}));
})(bwk || (bwk = {}));
var bwk;
(function (bwk) {
    var common;
    (function (common) {
        var Manager = (function () {
            function Manager(application) {
                this.application = application;
            }
            Manager.prototype.init = function () {
                var me = this;
                return new Promise(function (resolve, reject) {
                    //console.log('base manager init');
                    resolve(Promise.resolve());
                });
            };
            return Manager;
        })();
        common.Manager = Manager;
    })(common = bwk.common || (bwk.common = {}));
})(bwk || (bwk = {}));
/// <reference path="Cycle.ts"/>
/// <reference path="Util.ts"/>
/// <reference path="data/_index.ts"/>
/// <reference path="model/_index.ts"/>
/// <reference path="tracking/_index.ts"/>
/// <reference path="training/_index.ts"/>
/// <reference path="Application.ts"/>
/// <reference path="Connection.ts"/>
/// <reference path="Manager.ts"/>
/// <reference path="d.ts/bluebird.d.ts"/>
/// <reference path="d.ts/node.d.ts"/>
/// <reference path="common/_index.ts"/>
// global requires
global.Promise = require('bluebird');
var uuid = require('uuid');
var obs = require('observe-js');
var ObjectObserver = obs.ObjectObserver;
var ArrayObserver = obs.ArrayObserver;
// export the root domain names (modules)
module.exports.common = bwk.common;
