export interface Gesture extends GestureCalculation {
    status: "start" | "change" | "inertiastart" | "inertia" | "end";
    delta: GestureCalculation;
    center: GesturePoints;
    target: HTMLElement;
}

export interface GesturePoints {
    offset: WebKitPoint;
    screen: WebKitPoint;
    client: WebKitPoint;
}

export interface GestureCalculation {
    pan: WebKitPoint;
    zoom: number;
    rotation: number;
}

export default class {
    private _observing: HTMLElement;
    private _resolver: (gesture: Gesture) => void;
    private _previousCumulative: GestureCalculation;
    private _msGesture = (window as any).MSGesture && new MSGesture();

    private _pointerDownListenerMSGesture = (ev: PointerEvent) => this._msGesture && this._msGesture.addPointer(ev.pointerId);

    private _msGestureStartListener = (ev: MSGestureEvent) => {
        const cumulative = this._convertMSGestureEvent(ev);
        
        this._resolver({
            status: "start",
            ...cumulative,
            delta: {
                pan: cumulative.pan,
                zoom: cumulative.zoom,
                rotation: cumulative.rotation
            },
            target: this._observing
        });
        this._previousCumulative = cumulative;
    };

    private _msGestureChangeListener = (ev: MSGestureEvent) => {
        // status: inertia if ev.detail === ev.MSGESTURE_FLAG_INERTIA
        // status: change if not

        const cumulative = this._convertMSGestureEvent(ev);
        
        this._resolver({
            status: ev.detail === ev.MSGESTURE_FLAG_INERTIA ? "inertia" : "change",
            ...cumulative,
            delta: this._produceDelta(cumulative),
            target: this._observing
        });
        this._previousCumulative = cumulative;
    };

    private _msInertiaStartListener = (ev: MSGestureEvent) => {
        const cumulative = this._convertMSGestureEvent(ev);
        
        this._resolver({
            status: "inertiastart",
            ...cumulative,
            delta: this._produceDelta(cumulative),
            target: this._observing
        });
        this._previousCumulative = cumulative;
    };

    private _msGestureEndListener = (ev: MSGestureEvent) => {
        // status: end
        const cumulative = this._convertMSGestureEvent(ev);

        this._resolver({
            status: "end",
            ...cumulative,
            delta: this._produceDelta(cumulative),
            target: this._observing
        });
        this._previousCumulative = cumulative;
    };

    private _webkitGestureStartListener = (ev: any) => {

    };

    private _webkitGestureChangeListener = (ev: any) => {

    };

    private _webkitGestureEndListener = (ev: any) => {

    };

    private _pointerDownListener = (ev: PointerEvent) => {

    }

    private _pointerMoveListener = (ev: PointerEvent) => {

    }

    private _pointerUpListener = (ev: PointerEvent) => {
        
    }

    async *observe(element: HTMLElement) {
        if (this._observing) {
            throw new Error("Already observing another element")
        }
        this._observing = element;
        this._msGesture.target = element;
        let promise = new Promise<Gesture>(resolve => this._resolver = resolve);
        
        if ((window as any).MSGestureEvent) {
            // Microsoft Edge
            // supports .expansion, .rotation, .scale, .translationX, .translationY, .velocityAngular,
            // .velocityExpansion, .velocityX, .velocityY
            element.addEventListener("pointerdown", this._pointerDownListenerMSGesture);
            element.addEventListener("MSGestureStart", this._msGestureStartListener);
            element.addEventListener("MSGestureChange", this._msGestureChangeListener);
            element.addEventListener("MSInertiaStart", this._msInertiaStartListener);
            element.addEventListener("MSGestureEnd", this._msGestureEndListener);
        }
        else if ((window as any).GestureEvent) {
            // Apple Safari
            // Safari does not indicate inertia
            // supports .rotation / .scale
            element.addEventListener("gesturestart", this._webkitGestureStartListener);
            element.addEventListener("gesturechange", this._webkitGestureChangeListener);
            element.addEventListener("gestureend", this._webkitGestureEndListener);
        }
        else {
            // A browser with no native gesture indicator
            // Gestures should be be manually calculated
            element.addEventListener("pointerdown", () => {});
            element.addEventListener("pointermove", () => {});
            element.addEventListener("pointerup", () => {});
        }

        while (this._observing) {
            const result = await promise;
            if (!result) {
                return;
            }
            promise = new Promise<Gesture>(resolve => this._resolver = resolve);

            yield result;
        }
    }

    disconnect() {
        if (this._observing) {
            return;
        }

        this._observing.removeEventListener("pointerdown", this._pointerDownListenerMSGesture);
        this._observing.removeEventListener("MSGestureStart", this._msGestureStartListener);
        this._observing.removeEventListener("MSGestureChange", this._msGestureChangeListener);
        this._observing.removeEventListener("MSInertiaStart", this._msInertiaStartListener);
        this._observing.removeEventListener("MSGestureEnd", this._msGestureEndListener);

        this._observing.removeEventListener("gesturestart", this._webkitGestureStartListener);
        this._observing.removeEventListener("gesturechange", this._webkitGestureChangeListener);
        this._observing.removeEventListener("gestureend", this._webkitGestureEndListener);

        this._resolver(undefined);
    }

    private _convertMSGestureEvent(ev: MSGestureEvent): GestureCalculation & { center: GesturePoints } {
        return {
            pan: {
                x: ev.translationX,
                y: ev.translationY
            },
            zoom: ev.scale,
            rotation: ev.rotation * 180 / Math.PI, /* radian to degree, to match CSSMatrix implementation */
            center: {
                offset: {
                    x: ev.offsetX,
                    y: ev.offsetY
                },
                screen: {
                    x: ev.screenX,
                    y: ev.screenY
                },
                client: {
                    x: ev.clientX,
                    y: ev.clientY
                }
            }
        };
    }

    private _produceDelta(cumulative: GestureCalculation): GestureCalculation {
        return {
            pan: {
                x: cumulative.pan.x - this._previousCumulative.pan.x,
                y: cumulative.pan.y - this._previousCumulative.pan.y,

            },
            zoom: cumulative.zoom / this._previousCumulative.zoom,
            rotation: cumulative.rotation - this._previousCumulative.rotation
        };
    }
}

if (!Symbol.asyncIterator) {
    (Symbol as any).asyncIterator = Symbol("async-iterator");
}
