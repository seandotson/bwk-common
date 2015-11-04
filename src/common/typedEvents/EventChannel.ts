// / <reference path="./Event"/>
// / <reference path="./EventDispatcher"/>

module TypedEvents {
    "use strict";

    export class EventChannel<T extends Event> {
        
        private _muted: boolean = false;
        private _basicListeners: ((event: T) => void)[] = [];
        private _throughListeners: ((event: T) => void)[] = [];

        constructor(private _cleaner: () => void) { }

        // clean this event when all listeners are removed:
        private _check(): void {
            if(this._basicListeners.length === 0
                && this._throughListeners.length === 0
                && !this._muted) {
                this._cleaner();
            }
        }

        public on(listener: (event: T) => void, triggerOnSubClass: boolean = true): boolean {
            var container = triggerOnSubClass ? this._throughListeners : this._basicListeners;

            if(container.indexOf(listener) < 0) {
                container.push(listener);
                return true;
            }

            return false;
        }

        public off(listener: (event: T) => void, triggerOnSubClass: boolean = true): boolean {
            var container = triggerOnSubClass ? this._throughListeners : this._basicListeners;

            var index = container.indexOf(listener);
            if(index > -1) {
                container.splice(index, 1);
            }

            this._check();

            return index > -1;
        }

        public trigger(onSubClass: boolean, event: T): boolean {
            if(this._muted) return true;

            if(!onSubClass && this.trigger(true, event))
                return true;

            var container = onSubClass ? this._throughListeners : this._basicListeners;

            for(var listener of container) {
                listener(event);

                if(event.canceled) return true;
            }

            return event.canceled;
        }

        public has(listener: (event: T) => void, triggerOnSubClass: boolean): boolean {
            if(listener) {
                var container = triggerOnSubClass ? this._throughListeners : this._basicListeners;
                this._check();
                return container.indexOf(listener) > -1;
            }

            return this._basicListeners.length > 0 || this._throughListeners.length > 0;
        }

        public get muted(): boolean {
            return this._muted;
        }

        public set muted(value: boolean) {
            this._muted = value;
            this._check();
        }

    }

}
