class Api {

    constructor(app) {
        this.app = app;

        this.urlBase = `http://${location.host}/`;
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

}
