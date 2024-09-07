import "core-js/stable/array/find";
import "core-js/stable/promise";
import "whatwg-fetch";
import "./legacy/array";
import "./legacy/performance";

import {Renderer} from "./renderer";
import {Pgs} from "./pgs";

const pgs = new Pgs();
let renderer: Renderer | undefined = undefined;

/**
 * Implement console methods if they're missing.
 */
const makeConsole = () => {
    if (typeof console !== 'undefined') {
        console.debug('native console');
        return;
    }

    console = (function () {
        const postConsoleMessage = (prefix: string, ...args: any[]) => {
            postMessage({
                op: `console-${prefix}`,
                content: JSON.stringify(args),
            });
        };

        return {
            log: (...args: any[]) => {
                postConsoleMessage('log', ...args);
            },
            debug: (...args: any[]) => {
                postConsoleMessage('debug', ...args);
            },
            info: (...args: any[]) => {
                postConsoleMessage('info', ...args);
            },
            warn: (...args: any[]) => {
                postConsoleMessage('warn', ...args);
            },
            error: (...args: any[]) => {
                postConsoleMessage('error', ...args);
            }
        }
    })() as any;

    console.debug('overridden console');
}

// Inform the main process that the subtitle data was loaded and return all update timestamps
const submitTimestamps = () => {
    postMessage({
        op: 'updateTimestamps',
        updateTimestamps: pgs.updateTimestamps
    })
}

// Handles messages from the main thread.
onmessage = (e: MessageEvent) => {
    switch (e.data.op) {

        // Initialized the worker thread and receives the canvas (if supported).
        case 'init': {
            makeConsole();

            const canvas: OffscreenCanvas = e.data.canvas;

            // The canvas is optional. If provided, the web-worker can use it to render the subtitles.
            if (canvas) {
                renderer = new Renderer(canvas);
            }
            break;
        }

        // Tells the worker to load a subtitle file from an url.
        case 'loadFromUrl': {
            const url: string = e.data.url;
            pgs.loadFromUrl(url, {
                onProgress: () => {
                    submitTimestamps();
                }
            }).then(() => {
                submitTimestamps();
            });
            break;
        }

        // Tells the worker to load a subtitle file from the given buffer.
        case 'loadFromBuffer': {
            const buffer: ArrayBuffer = e.data.buffer;
            pgs.loadFromBuffer(buffer).then(() => {
                submitTimestamps();
            });

            break;
        }

        // Renders the subtitle at the given index inside the worker.
        // This is only supported if a canvas was provided to the worker.
        case 'render': {
            const index: number = e.data.index;
            const subtitleData = pgs.getSubtitleAtIndex(index);
            requestAnimationFrame(() => {
                renderer?.draw(subtitleData);
            });
            pgs.cacheSubtitleAtIndex(index + 1);
            break;
        }

        // Requests to build the subtitle pixel data.
        case 'requestSubtitleData': {
            const index: number = e.data.index;
            const subtitleData = pgs.getSubtitleAtIndex(index);

            // Returns the data to the main thread.
            postMessage({
                op: 'subtitleData',
                index: index,
                subtitleData: subtitleData
            })

            pgs.cacheSubtitleAtIndex(index + 1);
            break;
        }
    }
}

