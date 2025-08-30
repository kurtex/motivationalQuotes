import '@testing-library/jest-dom';

// Mock Web APIs for Node.js environment
global.Request = class Request {
  constructor(input, init) {
    this.url = input;
    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
    this.body = init?.body;
    if (this.body && typeof this.body !== 'string') {
        this.body = JSON.stringify(this.body);
    }
  }
  json() {
    return Promise.resolve(JSON.parse(this.body || '{}'));
  }
};

global.Response = class Response {
  constructor(body, init) {
    this.body = body;
    this.status = init?.status || 200;
    this.headers = new Headers(init?.headers);
  }
  static json(data, init) {
    const body = JSON.stringify(data);
    return new Response(body, init);
  }
};

global.Headers = class Headers {
    constructor(init) {
        this.headers = new Map(Object.entries(init || {}));
    }
    get(key) { return this.headers.get(String(key).toLowerCase()); }
    set(key, value) { this.headers.set(String(key).toLowerCase(), String(value)); }
    has(key) { return this.headers.has(String(key).toLowerCase()); }
    [Symbol.iterator]() { return this.headers.entries(); }
};

global.ReadableStream = class ReadableStream {
    constructor(underlyingSource) {
        this._source = underlyingSource;
    }
    getReader() {
        const source = this._source;
        let started = false;
        const chunks = [];
        let closed = false;

        const controller = {
            enqueue: (chunk) => chunks.push(chunk),
            close: () => closed = true,
        };

        return {
            async read() {
                if (!started) {
                    started = true;
                    if (source && source.start) {
                        await source.start(controller);
                    }
                }
                if (chunks.length > 0) {
                    return { done: false, value: chunks.shift() };
                } else {
                    return { done: closed, value: undefined };
                }
            },
        };
    }
};

global.TextEncoder = class TextEncoder {
    encode(str) {
        // In Node.js, Buffer can be used to convert string to Uint8Array
        return new Uint8Array(Buffer.from(str, 'utf-8'));
    }
};
