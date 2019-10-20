import _ from 'lodash';
import togglClient from './togglClient';
import moment from 'moment';
import overtimeHelper from 'utils/overtimeHelper';

var Datastore = require('nedb');


function formatMonth(dateString) {
    var monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    const date = new Date(dateString);
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return monthNames[monthIndex];
}

const partition = (array, isValid) => {
    return array.reduce(([pass, fail], elem) => {
        return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    }, [[], []]);
}

export function getWeeklyStats() {
    return new Promise(resolve => {
        const from_date = moment().subtract(1, 'weeks').startOf('isoWeek').toDate();
        const to_date = moment().endOf('isoWeek').toDate();

        const db = new Datastore({ filename: 'toggl.db', autoload: true });
        const data = db.find({ start: { $gte: from_date }, start: { $lte: to_date } }, async function (err, data) {
            const startOfWeek = moment().startOf('isoWeek').toDate();
            const partitioned = partition(data, x => moment(x.start).isBefore(startOfWeek));

            const sourceData = _(partitioned[1])
                .orderBy(y => new Date(y.start))
                .groupBy(x => {
                    const tempDate = new Date(x.start);
                    return new Date(
                        tempDate.getUTCFullYear(),
                        tempDate.getUTCMonth(),
                        tempDate.getDate()
                    );
                });

            const helper = new overtimeHelper();
            const overtime = await helper.getByDates(from_date, to_date);

            const workedSeries = sourceData.map((x, i) => _(x).orderBy(y => new Date(y.start)).map(y => y.dur).sum() / (1000 * 60 * 60)).value();
            const overtimeSeries = _(sourceData)
                .chain()
                .map((x, k) => new Date(k))
                .map((x, i) => {
                    const overtimeForThisDay = _(overtime).filter(y => y.date.setHours(0) - x.setHours(0) === 0).first();
                    return workedSeries[i] - (overtimeForThisDay && overtimeForThisDay.overtime || 0);
                })
                .flatten()
                .value();

            var chartData = {
                labels: sourceData.map((x, k) => new Date(k)).orderBy(x => x).value(),
                series: [overtimeSeries, workedSeries]
            };

            resolve({
                chartData: chartData,
                totalLastWeek: _(partitioned[0]).map(x => x.dur).sum() / (1000 * 60 * 60),
                totalThisWeek: _(partitioned[1]).map(x => x.dur).sum() / (1000 * 60 * 60)
            });
        })
    });
}

/**
 * 
 */
export function getMonthlyStats() {

    return new Promise(resolve => {
        var endDate = new Date();
        const db = new Datastore({ filename: 'toggl.db', autoload: true });

        const from_date = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1);
        const to_date = new moment().add(1, 'months').date(0);
        const data = db.find({ start: { $gt: from_date, $lte: to_date } }, async function (err, data) {
            const sourceData = _(data).groupBy(x => {
                const tempDate = new Date(x.start);
                return new Date(
                    tempDate.getUTCFullYear(),
                    tempDate.getUTCMonth(),
                    tempDate.getDate()
                );
            });

            const helper = new overtimeHelper();
            const overtime = await helper.getByDates(from_date, to_date);

            const workedSeries = sourceData.map((x, i) => _(x).orderBy(y => new Date(y.start)).map(y => y.dur).sum() / (1000 * 60 * 60)).value();
            const overtimeSeries = _(sourceData)
                .chain()
                .map((x, k) => new Date(k))
                .map((x, i) => {
                    const overtimeForThisDay = _(overtime).filter(y => y.date.setHours(0) - x.setHours(0) === 0).first();
                    return workedSeries[i] - (overtimeForThisDay && overtimeForThisDay.overtime || 0);
                })
                .flatten()
                .value();

            var chartData = {
                labels: sourceData.map((x, k) => new Date(k).getDate()).orderBy(x => x).value(),
                series: [overtimeSeries, workedSeries]
            };

            resolve(chartData);
        })
    });
}

export async function getYearlyStats() {
    return new Promise(resolve => {
        var endDate = new Date();
        const db = new Datastore({ filename: 'toggl.db', autoload: true });
        db.find({ start: { $gt: new Date(endDate.getUTCFullYear(), 0, 1) } }, function (err, data) {
            const sourceData = _(data)
                .orderBy(x => new Date(x.start))
                .groupBy(x => {
                    const tempDate = new Date(x.start);
                    return new Date(tempDate.getUTCFullYear(), tempDate.getUTCMonth());
                });

            var chartData = {
                labels: sourceData.map((x, k) => new Date(k)).value(),
                series: [sourceData.map((x, i) => _(x).map(y => y.dur).sum() / (1000 * 60 * 60)).value()]
            };

            resolve(chartData);
        })
    });
}

export async function getAllStats() {
    return new Promise(resolve => {

        // All time
        const db = new Datastore({ filename: 'toggl.db', autoload: true });
        db.find({ start: { $gt: new Date(2007, 0, 1) } }, function (err, data) {

            const allTimeSourceData = _(data)
                .orderBy(x => new Date(x.start))
                .groupBy(x => {
                    const tempDate = new Date(x.start);
                    return 'Q' + moment(tempDate).quarter() + ' ' + tempDate.getUTCFullYear()
                });

            var chartData = {
                labels: allTimeSourceData.map((x, k) => k).value(),
                series: [allTimeSourceData.map((x, i) => _(x).map(y => y.dur).sum() / (1000 * 60 * 60)).value()]
            };

            resolve(chartData);
        })
    });
}

export async function getLatestEntries() {
    return new Promise(resolve => {
        var endDate = new Date();
        var startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        const db = new Datastore({ filename: 'toggl.db', autoload: true });
        db.find({ start: { $gt: startDate } }, function (err, data) {
            resolve(_(data).orderBy(x => new Date(x.start)).reverse().value());
        });
    });
}