module bwk.common.model {
  export interface IGroupModel {


    sessionLookup: { [id: string]: IPublicSession };
    sessionList: Array<IPublicSession>;



  }
}
