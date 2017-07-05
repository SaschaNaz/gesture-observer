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
export default class  {
    private _observing;
    private _resolver;
    private _previousCumulative;
    private _msGesture;
    private _pointerDownListener;
    private _msGestureStartListener;
    private _msGestureChangeListener;
    private _msInertiaStartListener;
    private _msGestureEndListener;
    private _webkitGestureStartListener;
    private _webkitGestureChangeListener;
    private _webkitGestureEndListener;
    observe(element: HTMLElement): AsyncIterableIterator<Gesture>;
    disconnect(): void;
    private _convertMSGestureEvent(ev);
    private _produceDelta(cumulative);
}
