var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
export default class {
    constructor() {
        this._msGesture = window.MSGesture && new MSGesture();
        this._pointerDownListenerMSGesture = (ev) => this._msGesture && this._msGesture.addPointer(ev.pointerId);
        this._msGestureStartListener = (ev) => {
            const cumulative = this._convertMSGestureEvent(ev);
            this._resolver(Object.assign({ status: "start" }, cumulative, { delta: {
                    pan: cumulative.pan,
                    zoom: cumulative.zoom,
                    rotation: cumulative.rotation
                }, target: this._observing }));
            this._previousCumulative = cumulative;
        };
        this._msGestureChangeListener = (ev) => {
            // status: inertia if ev.detail === ev.MSGESTURE_FLAG_INERTIA
            // status: change if not
            const cumulative = this._convertMSGestureEvent(ev);
            this._resolver(Object.assign({ status: ev.detail === ev.MSGESTURE_FLAG_INERTIA ? "inertia" : "change" }, cumulative, { delta: this._produceDelta(cumulative), target: this._observing }));
            this._previousCumulative = cumulative;
        };
        this._msInertiaStartListener = (ev) => {
            const cumulative = this._convertMSGestureEvent(ev);
            this._resolver(Object.assign({ status: "inertiastart" }, cumulative, { delta: this._produceDelta(cumulative), target: this._observing }));
            this._previousCumulative = cumulative;
        };
        this._msGestureEndListener = (ev) => {
            // status: end
            const cumulative = this._convertMSGestureEvent(ev);
            this._resolver(Object.assign({ status: "end" }, cumulative, { delta: this._produceDelta(cumulative), target: this._observing }));
            this._previousCumulative = cumulative;
        };
        this._webkitGestureStartListener = (ev) => {
        };
        this._webkitGestureChangeListener = (ev) => {
        };
        this._webkitGestureEndListener = (ev) => {
        };
        this._pointerDownListener = (ev) => {
        };
        this._pointerMoveListener = (ev) => {
        };
        this._pointerUpListener = (ev) => {
        };
    }
    observe(element) {
        return __asyncGenerator(this, arguments, function* observe_1() {
            if (this._observing) {
                throw new Error("Already observing another element");
            }
            this._observing = element;
            this._msGesture.target = element;
            let promise = new Promise(resolve => this._resolver = resolve);
            if (window.MSGestureEvent) {
                // Microsoft Edge
                // supports .expansion, .rotation, .scale, .translationX, .translationY, .velocityAngular,
                // .velocityExpansion, .velocityX, .velocityY
                element.addEventListener("pointerdown", this._pointerDownListenerMSGesture);
                element.addEventListener("MSGestureStart", this._msGestureStartListener);
                element.addEventListener("MSGestureChange", this._msGestureChangeListener);
                element.addEventListener("MSInertiaStart", this._msInertiaStartListener);
                element.addEventListener("MSGestureEnd", this._msGestureEndListener);
            }
            else if (window.GestureEvent) {
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
                element.addEventListener("pointerdown", () => { });
                element.addEventListener("pointermove", () => { });
                element.addEventListener("pointerup", () => { });
            }
            while (this._observing) {
                const result = yield __await(promise);
                if (!result) {
                    return yield __await(void 0);
                }
                promise = new Promise(resolve => this._resolver = resolve);
                yield yield __await(result);
            }
        });
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
    _convertMSGestureEvent(ev) {
        return {
            pan: {
                x: ev.translationX,
                y: ev.translationY
            },
            zoom: ev.scale,
            rotation: ev.rotation * 180 / Math.PI,
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
    _produceDelta(cumulative) {
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
    Symbol.asyncIterator = Symbol("async-iterator");
}
//# sourceMappingURL=gesture-observer.js.map