module common.model {
  export interface IClientSession {


    location: ILocation;

    //coords: IGeoCoords;

    //acceleration: IAcceleration;

    orientation: IRotation;

    //rotationRate: IRotation;

    isOnline: boolean;
    started: Date;

    log: Array<string>


  }
}
