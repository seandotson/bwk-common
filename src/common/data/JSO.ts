/// <reference path="../Cycle.ts"/>


module common.data {


  export class JSOOptions {

    cyclic: boolean = true;
    shorthand: boolean = false;
    functions: boolean = true;
    dates: boolean = true;
    regex: boolean = false;
    strict: boolean = false;

    constructor(config: Object) {
      if (config) {
        this.applyBoolean(config, 'cyclic');
        this.applyBoolean(config, 'shorthand');
        this.applyBoolean(config, 'functions');
        this.applyBoolean(config, 'dates');
        this.applyBoolean(config, 'regex');
        this.applyBoolean(config, 'strict');
      }
    }

    applyBoolean(config, name): void {
      var value = config[name];
      switch (typeof value) {
        case 'boolean':
          this[name] = value;
          break;
      }
    }

    isComplex(): boolean {
      return this.functions || this.dates || this.regex;
    }

  }

  export class JSO {


    static serialize(obj: Object, opt?: Object): string {

      // grab options
      var options = new JSOOptions(opt),
        serial;

      if (options.strict) {
        return JSON.stringify(obj);
      } else {

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
        } else {
          // simple stringify will do
          serial = JSON.stringify(obj);
        }
      }

      return serial;
    }


    static deserialize(serial: string, opt?: Object): Object {

      // grab options
      var options = new JSOOptions(opt),
        obj;

      if (options.strict) {
        return JSON.parse(serial);
      } else {

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
    }

    // public aliases
    static hydrateInPlace(item: Object, opt?: Object): void {
      var options = new JSOOptions(opt);
      if (options.dates) JSO.decodeDates(item);
      if (options.shorthand) JSO.decodeShorthand(item);
      // hydrate to add back the loops
      JSON2.retrocycle(item);
    }

    static dehydrateClone(item: Object, opt?: Object): Object {
      var options = new JSOOptions(opt);
      var clone = JSON2.decycle(item);
      if (options.shorthand) JSO.encodeShorthand(clone);
      if (options.dates) JSO.encodeDates(clone);
      return clone;
    }

    static encodeDates(item: Object): number {
      // convert Date to 'date:Sun Mar 08 2015 19:13:57 GMT-0400 (EDT)'
      return JSO.walkTreeReplace(item, undefined, 0, function(value) {
        return value instanceof Date && !isNaN(value.valueOf());
      }, function(value, parent, qualifier) {
          return 'date:' + value;
        });
    }

    static decodeDates(item: Object): number {
      // convert 'date:Sun Mar 08 2015 19:13:57 GMT-0400 (EDT)' to Date
      return JSO.walkTreeReplace(item, undefined, 0, function(value) {
        return typeof value === 'string' && value.length > 20 && value.substr(0, 5) === 'date:';
      }, function(value, parent, qualifier) {
          return new Date(value.substr(5));
        });
    }


    private static encodeShorthand(item: Object): number {
      // convert {$ref:'$["app"]["sala-nz-monitor"]'} to 'ref:app.sala-nz-monitor'
      return JSO.walkTreeReplace(item, undefined, 0, function(value) {
        return typeof value === 'object' && value['$ref'];
      }, function(value, parent, qualifier) {
          var str = value['$ref'];
          str = str
            .replace(/\$\["/g, '')
            .replace(/"\]\["/g, '.')
            .replace(/"\]/g, '');
          return 'ref:' + str;
        });
    }


    private static decodeShorthand(item: Object): number {
      // convert 'ref:app.sala-nz-monitor' to {$ref:'$["app"]["sala-nz-monitor"]'}
      return JSO.walkTreeReplace(item, undefined, 0, function(value) {
        return typeof value === 'string' && value.length > 4 && value.substr(0, 4) === 'ref:';
      }, function(value, parent, qualifier) {
          var tokens = value.split(':')[1].split('.');
          return {
            '$ref': '$["' + tokens.join('"]["') + '"]'
          };
        });
    }


    private static walkTreeReplace(parent: any, qualifier: any, count: number, filter: (value: any) => boolean, convert: (value: any, parent: any, qualifier: any) => any): number {
      var i, k, value, hasValue;
      if (qualifier === undefined) {
        value = parent;
      } else {
        hasValue = true;
        value = parent[qualifier];
      }
      if (hasValue && filter(value)) {
        count += 1;
        parent[qualifier] = convert(value, parent, qualifier);
      } else {
        if (value instanceof Array) {
          for (i = 0; i < value.length; i++) {
            count = JSO.walkTreeReplace(value, i, count, filter, convert);
          }
        } else {
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
    }


  }


}
