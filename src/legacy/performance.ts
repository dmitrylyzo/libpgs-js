/**
 * performance.now() polyfill.
 */

if ('performance' in self === false) {
    performance = {} as any;
}

Date.now = (Date.now || function () {
    return new Date().getTime();
});

if ("now" in performance === false) {
    let nowOffset = Date.now();

    if ((performance as any).timing?.navigationStart) {
        nowOffset = (performance as any).timing.navigationStart
    }

    (performance as any).now = () => {
        return Date.now() - nowOffset;
    }
}
