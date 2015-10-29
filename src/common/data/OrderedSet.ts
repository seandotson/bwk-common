module bwk.common.data {
  export class OrderedSet<T> {

    list: Array<T>;
    lookup: { [id: string] : T };

    constructor(idFn?:(T)=>string, data?:Array<T>){
      this.list = [];
      this.lookup = {};
      if(idFn) this.findId = idFn;
      if(data) this.addItems(data);
    }

    // default findId function.  can be overridden in constructor
    findId(item : T) : string {
      return item['_id'] || item['id'] || null;
    }

    addItems(data : Array<T>) : void {
      var i, item : T;
      for(i=0; i<data.length; i++){
        item = data[i];
        this.add(this.findId(item), item);
      }
    }

    add(id:string, item: T ) : void {
      if(!id) throw new Error('Invalid Id');
      if(this.exists(id)) throw new Error('Duplicate Id');
      this.lookup[id] = item;
      this.list.push(item);
    }

    exists(id:string) : boolean {
      return this.lookup[id] !== undefined;
    }

    get(id:string) : T {
      return this.lookup[id];
    }

    sequence(fn:(T)=>Promise<void>) : Promise<void> {
      var i : number,
          item : T,
          promise : Promise<void> = Promise.resolve();
      function addThen(item : T){
        promise = promise.then(function(){
          return fn(item);
        });
      }
      for(i=0; i<this.list.length; i++){
        addThen(this.list[i]);
      }
      return promise;
    }


  }
}
