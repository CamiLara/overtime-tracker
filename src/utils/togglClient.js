import Moment from 'moment';
import {
    extendMoment
} from 'moment-range';
import {
    addDays,
    addMonths,
    differenceInDays,
    differenceInMonths
} from 'date-fns';
import _ from 'lodash';
import * as Promise from "bluebird";

const queryString = require('query-string');

const moment = extendMoment(Moment);

export default class TogglClient {
    constructor(apiKey, workspace) {
        if (!apiKey)
            throw new Error('api key cannot be null');

        if (!workspace)
            throw new Error('workspace cannot be null');

        this.apiKey = apiKey;
        this.workspace = workspace;

        const baseUri = "https://toggl.com/";
        this.reportsBaseUri = `${baseUri}reports/api/v2/details?`;
    }

    makeRequest(method, url) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.setRequestHeader("authorization", "Basic " + btoa(me.apiKey + ":api_token"));
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
    }

    async fetchTimeEntries(startDate = new Date(2007, 1, 1), endDate = new Date(2025, 1, 1), page = 1) {

        //console.log(startDate + ' -> ' + endDate + ':' + page);

        const stringified = queryString.stringify({
            since: startDate && new Date(startDate).toISOString(),
            until: endDate && new Date(endDate).toISOString(),
            workspace_id: this.workspace,
            user_agent: 'hendrik.bulens@gmail.com',
            page: page
        });

        const response = await this.makeRequest("GET", this.reportsBaseUri + stringified);
        return JSON.parse(response);
    }

    async fetchPagedTimeEntries(startDate = new Date(2016, 1, 1), endDate = new Date(2025, 1, 1)) {
        const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        async function sleep(duration, fn, ...args) {
            await timeout(duration);
            return fn(...args);
        }

        const loop = async (start, end) => {
            //console.log('Loop iteration:' + startDate + ' -> ' + endDate);
            let result = [];
            let counter = 1;
            let total = 1;

            while (result.length < total) {
                await sleep(1000, async () => {
                    var {
                        data,
                        total_count
                    } = await this.fetchTimeEntries(start, end, counter);
                    total = total_count;
                    result = [...result, ...data];

                    counter += 1;
                })
            }

            return result;
        }

        const range = moment.range(startDate, endDate);
        if (range.duration('days') > 365) {
            const getRange = (startDate, endDate, interval) => {
                if (interval === "day") {
                    const days = differenceInDays(endDate, startDate);
                    return [...Array(days + 1).keys()].map((i) => addDays(startDate, i));
                }

                if (interval === "month") {
                    const months = differenceInMonths(endDate, startDate);

                    return [...Array(months + 1).keys()].map((i) => addMonths(startDate, i));
                }
            }

            const years = _(getRange(startDate, endDate, 'day'))
                .groupBy(x => x.getYear())
                .map(x => ({
                    min: _(x).min(),
                    max: _(x).max()
                }))
                .value();

            const loop2 = () => Promise.map(years, async item => await loop(item.min, item.max), { concurrency: 3 });
            return loop2().then(res => _(res).flatten().value());
        }

        return await loop(startDate, endDate);
    }
}