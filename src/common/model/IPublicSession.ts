module bwk.common.model {
  export interface IPublicSession {


    id: string;
    name: string;
    joinDate: Date;
    location: ILocation;
    orientation: IRotation;


  }
}
