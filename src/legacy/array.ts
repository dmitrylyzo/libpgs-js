/**
 * Array polyfills.
 */

if (!Uint8Array.prototype.slice) {
    Object.defineProperty(Uint8Array.prototype, 'slice', {
        value: function (begin: number, end?: number) {
            return new Uint8Array(this.subarray(begin, end));
        }
    });
}
