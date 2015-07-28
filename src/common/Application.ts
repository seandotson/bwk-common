module common {
  export class Application {

    //managers: { [id: string]: Manager };


    //constructor() {
    //  this.managers = {};
    //}


    init(): Promise<void> {
      //return this.callManagersSequence('init');
      //console.log('base application init');
      return Promise.resolve();
    }


    /*
        addManager(name: string, manager: Manager): Application {
          this.managers[name] = manager;
          return this;
        }

        getManager(name: string): Manager {
          return this.managers[name];
        }
        */

    callSequence(promises: Array<Promise<void>>): Promise<void> {
      var me = this;
      if (promises.length) {
        var promise: Promise<void> = promises.shift();
        return Promise.resolve(promise)
          .then(function() {
            return me.callSequence(promises);
          });
      }
      else {
        return Promise.resolve();
      }
    }

    /*
        callManagersSequence(fnName: string, args?: Array<any>): Promise<void> {
          var manager: Manager;
          var key: string;
          var promises = [];
          args = args || [];
          for (key in this.managers) {
            if (this.managers.hasOwnProperty(key)) {
              manager = this.managers[key];
              if (manager[fnName]) {
                promises.push(manager[fnName].apply(manager, args));
              }
            }
          }
          return this.callSequence(promises);
        }
    */


  }
}
