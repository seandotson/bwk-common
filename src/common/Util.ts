module bwk.common {
class Util {

  static arrayify(item: Object, keyProp: string): Array<Object> {
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
  }

  static each(list: Array<Object>, fn: (item: Object, index?: number, list?: Array<Object>) => boolean, scope?: Object): void {
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
  }

  static apply(o1: Object, o2: Object): Object {
    var key;
    if (o1 && o2) {
      for (key in o2) {
        if (o2.hasOwnProperty(key)) {
          o1[key] = o2[key];
        }
      }
    }
    return o1;
  }

}
}
