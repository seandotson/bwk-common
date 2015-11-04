module TypedEvents {
    "use strict";

    export class EventDispatcher {       
        
        private _muted: boolean = false;
        private _channels: EventChannel<Event>[] = [];
        
        private _channel<T extends Event>(type: { new (...args: any[]): T }): EventChannel<T> {
            var index = EventDispatcher._id(type);
            if(index in this._channels)
                return this._channels[index];
            return this._channels[index] = new EventChannel(() => {
                // called when this event channel will need to be garbage collected:
                delete this._channels[index];
            });
        }
        
        public on<T extends Event>(type: { new (...args: any[]): T }, listener: (event: T) => void, triggerOnSubClass: boolean = true): boolean {
            return this._channel(type).on(listener, triggerOnSubClass);
        }
        
        public off<T extends Event>(type: { new (...args: any[]): T }, listener: (event: T) => void, triggerOnSubClass: boolean = true): boolean {
            return this._channel(type).off(listener, triggerOnSubClass);
        }
        
        public has<T extends Event>(type: { new (...args: any[]): T }, listener: (event: T) => void = null, triggerOnSubClass: boolean = true): boolean {
            return this._channel(type).has(listener, triggerOnSubClass);
        }
        
        public get muted(): boolean {
            return this._muted;
        }
        
        public set muted(value: boolean) {
            this._muted = value;
        }
        
        mute<T extends Event>(type: { new (...args: any[]): T }): void {
            this._channel(type).muted = true;
        }
        
        unmute<T extends Event>(type: { new (...args: any[]): T }): void {
            this._channel(type).muted = false;
        }
        
        isMute<T extends Event>(type: { new (...args: any[]): T }): boolean {
            return this._channel(type).muted;
        } 
        
        public trigger<T extends Event>(event: T): boolean {
            if(this._muted || event.canceled) return true;
            
            if(typeof event === 'object' && 'constructor' in event && typeof event.constructor === 'function') {
                var index = EventDispatcher._id(<any>event.constructor);
                var subClass = false;
                var canceled = false;
                
                while(typeof index === 'number' && !canceled) {
                    if(index in this._channels) 
                        canceled = this._channels[index].trigger(subClass, event);
                        
                    index = EventDispatcher._eventBases[index];
                    subClass = true;
                }
                
                return canceled;
            }
            
            return true;
        }
        
        public reset(): void {
            this._channels = [];
        }
        
        // will store events constructors to get an id on them:
        private static _eventConstructors: { new (...args: any[]): Event }[] = [];
        // will store events parent ids:
        private static _eventBases: number[] = [];
        
        // get the base class constructor of a class:
        private static _base<T extends Event>(type: { new (...args: any[]): T }) {
            var proto = type.prototype.__proto__;
            
            if(proto !== null && 'constructor' in proto) 
                return proto.constructor;
            return null;
        }
        
        // get the event id for the given class:
        private static _id<T extends Event>(type: { new (...args: any[]): T }): number {
            // search event id:
            var index = EventDispatcher._eventConstructors.indexOf(type);
            
            // if found return it:
            if(index > -1) return index;
            
            // create a new id for it:
            index = EventDispatcher._eventConstructors.push(type) - 1;
            
            // create baseid:
            var base = EventDispatcher._base(type);
            
            // add base to the database:
            if(base && typeof base === 'function') {
                EventDispatcher._eventBases[index] = EventDispatcher._id(base);
            } else {
                EventDispatcher._eventBases[index] = null;
            }
            
            return index;
        }
        
    }

}