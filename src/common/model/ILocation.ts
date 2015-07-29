module common.model {
  export interface ILocation {

    lat: number;
    lon: number;
    alt: number;

    altitudeAccuracy: number;
    accuracy: number;

    heading: number;
    speed: number;



  }
}
