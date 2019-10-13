const queryString = require('query-string');

export default class TogglClient {
    constructor(apiKey = '0d2f981c9cbb41aca1dd7f62bb40a121') {
        this.apiKey = apiKey;
    }

    fetchTimeEntries(startDate, endDate, callback) {
        const data = null;
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                const jsonResponse = JSON.parse(this.response);
                callback(jsonResponse);
            }
        });

        const stringified = queryString.stringify({
            start_date: startDate && new Date(startDate).toISOString(),
            end_date: endDate && new Date(endDate).toISOString()
        });

        xhr.open("GET", 'https://www.toggl.com/api/v8/time_entries?' + stringified);
        xhr.setRequestHeader("authorization", "Basic " + btoa(this.apiKey + ":api_token"));
        xhr.send(data);
    }
}

