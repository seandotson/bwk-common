module TypedEvents {
    "use strict";

    export class Event {
        
        private _canceled: boolean = false;
        
        public constructor(private _cancelable: boolean = true) { }
        
        public get cancelable(): boolean {
            return this._cancelable;
        }
        
        public get canceled(): boolean {
            return this._cancelable ? this._canceled : false;
        }
        
        public cancel(): void {
            this._canceled = this._cancelable;
        }
        
    }

}