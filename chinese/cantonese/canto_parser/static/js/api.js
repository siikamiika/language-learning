class Api {

    constructor(app) {
        this.app = app;

        this.urlBase = `http://${location.host}/`;

        this.ws = null;
    }

    async _request(method, path, data, headers, callback) {
        const response = await fetch(`${this.urlBase}${path}`, {
            method: method,
            headers: headers || undefined,
            body: ![undefined, null].includes(data) ? JSON.stringify(data) : undefined
        });
        const responseData = await response.json();
        callback(responseData);
    }

    async post(path, data, headers, callback) {
        await this._request('POST', path, data, headers, callback);
    }

    async get(path, query, headers, callback) {
        query = query || {};
        await this._request('GET', `${path}?${obj2qs(query)}`, null, headers, callback);
    }

    socket(url, onopen, onclose, onmessage) {
        onopen = onopen || (_ => {});
        onclose = onclose || (_ => {});
        onmessage = onmessage || (_ => {});

        this.ws = new WebSocket(url);
        this.ws.onopen = onopen;
        this.ws.onclose = onclose;
        this.ws.onmessage = onmessage;
    }

    tts(text, lang) {
        lang = lang || 'zh-HK';
        let encodedText = encodeURIComponent(text);
        let url = `https://code.responsivevoice.org/getvoice.php?t=${encodedText}&tl=${lang}&sv=g1&vn=&pitch=0.5&rate=0.3&vol=1&gender=female`;
        new Audio(url).play();
    }

}
