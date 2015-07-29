
module common.tracking {


  export interface ITrackerSubscription {

    active: boolean;
    initialDataCallback: (Object) => void;
    onChangeCallback: (Object) => void;

  }


}
