module bwk.common {
  export class Manager {


    application: Application;


    constructor(application: Application) {
      this.application = application;
    }



    init(): Promise<void> {
      var me = this;
      return new Promise<void>(function(resolve, reject) {
        //console.log('base manager init');
        resolve(Promise.resolve());
      });
    }

  }
}
