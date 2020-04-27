import _ from 'lodash';
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

const getDatesBetween = (startDate, endDate) => {
    const dates = [];

    // Strip hours minutes seconds etc.
    let currentDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
    );

    while (currentDate <= endDate) {
        dates.push(currentDate);

        currentDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() + 1, // Will increase month if over range
        );
    }

    return dates;
};

export function getWeeklyStats() {
    return new Promise(resolve => {
        const from_date = moment().subtract(1, 'weeks').startOf('isoWeek').toDate();
        const to_date = moment().endOf('isoWeek').toDate();

        const db = new Datastore({ filename: 'toggl.db', autoload: true });
        const data = db.find({ start: { $gte: from_date, $lte: to_date } }, async function (err, data) {
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

            const dateRange = getDatesBetween(moment().startOf('isoWeek').toDate(), new Date());
            const missingDates = _(dateRange).filter(x => !_.some(sourceData.map((x, i) => new Date(i)).value(), y => moment(y).isSame(x))).value();

            const helper = new overtimeHelper();
            const overtime = await helper.getByDates(from_date, to_date);

            const workedSeries = _(sourceData).map((x, i) => _(x).orderBy(y => new Date(y.start)).map(y => y.dur).sum() / (1000 * 60 * 60)).value();
            const labels = _([...sourceData.map((x, k) => new Date(k)).value(), ...missingDates]).orderBy(x => x).value();

            const overtimeSeries = _(labels)
                .chain()
                .map((x, i) => {                    
                    const overtimeForThisDay = _(overtime).filter(y => y.date && y.date.setHours(0) - x.setHours(0) === 0).first();
                    return (workedSeries[i] || 0) + (overtimeForThisDay && overtimeForThisDay.overtime || 0);
                })
                .flatten()
                .value();


            _(missingDates)
                .chain()
                .map(x => labels.indexOf(x))
                .each(x => {
                    workedSeries.splice(x, 0, 0);
                })
                .value();

            var chartData = {
                labels: labels,
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

        const from_date = moment(new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1)).subtract(1, 'months').startOf('month').toDate();
        const to_date = new moment().add(1, 'months').date(0).toDate();
        const data = db.find({ start: { $gte: from_date, $lte: to_date } }, async function (err, data) {

            const startOfMonth = moment().startOf('month').toDate();
            const partitioned = partition(data, x => moment(x.start).isBefore(startOfMonth));

            const sourceData = _(partitioned[1]).groupBy(x => {
                const tempDate = new Date(x.start);
                return new Date(
                    tempDate.getUTCFullYear(),
                    tempDate.getUTCMonth(),
                    tempDate.getDate()
                );
            });

            const dateRange = getDatesBetween(new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1), new Date());
            const missingDates = _(dateRange).filter(x => !_.some(sourceData.map((x, i) => new Date(i)).value(), y => moment(y).isSame(x))).value();

            const helper = new overtimeHelper();
            const overtime = await helper.getByDates(from_date, to_date);

            const workedSeries = sourceData.map((x, i) => _(x).orderBy(y => new Date(y.start)).map(y => y.dur).sum() / (1000 * 60 * 60)).value();
            const labels = _([
                ...sourceData.map((x, k) => new Date(k).getDate()).value(),
                ..._(missingDates).map(x => x.getDate()).value()
            ]).orderBy(x => x).value();

            const overtimeSeries = _(labels)
                .chain()
                .map((x, i) => {
                    const overtimeForThisDay = _(overtime).filter(y => y.date && y.date.getDate() === x).first();
                    return parseFloat((workedSeries[i] || 0) + (overtimeForThisDay && overtimeForThisDay.overtime || 0));
                })
                .flatten()
                .value();

            _(missingDates)
                .chain()
                .map(x => labels.indexOf(x))
                .each(x => {
                    workedSeries.splice(x, 0, 0);
                })
                .value();

            var chartData = {
                labels: labels,
                series: [overtimeSeries, workedSeries]
            };

            resolve({
                chartData: chartData,
                totalLastMonth: _(partitioned[0]).map(x => x.dur).sum() / (1000 * 60 * 60),
                totalThisMonth: _(partitioned[1]).map(x => x.dur).sum() / (1000 * 60 * 60)
            });
        })
    });
}

export async function getYearlyStats() {
    return new Promise(resolve => {
        var endDate = new Date();
        const db = new Datastore({ filename: 'toggl.db', autoload: true });

        const from_date = new Date((endDate.getUTCFullYear() - 1), 0, 1);
        const to_date = moment().endOf('year');

        db.find({ start: { $gte: from_date, $lte: to_date } }, async function (err, data) {
            const startOfYear = moment().startOf('year').toDate();
            const partitioned = partition(data, x => moment(x.start).isBefore(startOfYear));

            const sourceData = _(partitioned[1])
                .orderBy(x => new Date(x.start))
                .groupBy(x => {
                    const tempDate = new Date(x.start);
                    return new Date(tempDate.getUTCFullYear(), tempDate.getUTCMonth());
                });

            const workedSeries = sourceData.map((x, i) => _(x).map(y => y.dur).sum() / (1000 * 60 * 60)).value();
            const dateRange = getDatesBetween(new Date(endDate.getUTCFullYear(), 0, 1), new Date());

            const missingDatesGroup = sourceData
                .map((x, k) => new Date(k))
                .filter(x => moment(x).isAfter(moment().subtract(1, 'year')))
                .orderBy(x => x)
                .groupBy(x => {
                    const tempDate = new Date(x);
                    return new Date(tempDate.getUTCFullYear(), tempDate.getUTCMonth());
                })
                .map(x => x)
                .flatten()
                .value();

            const missingDates = _(missingDatesGroup).filter(x => !_.some(sourceData.map((x, i) => new Date(i)).value(), y => moment(y).isSame(x))).value();

            const helper = new overtimeHelper();
            const overtime = await helper.getByDates(from_date, to_date);
            const labels = _([...sourceData.map((x, k) => new Date(k)).value(), ...missingDates]).orderBy(x => x).value();

            const overtimeSeries = _(labels)
                .chain()
                .map((x, i) => {
                    const sum = _(overtime).filter(y => moment(x.date).startOf('month').isSame(x)).map(x => parseFloat(x.overtime)).reduce((sum, n) => sum + n) || 0;
                    return (workedSeries[i] || 0) + sum;
                })
                .flatten()
                .value();
            
            _(missingDates)
                .chain()
                .map(x => labels.indexOf(x))
                .each(x => {
                    workedSeries.splice(x, 0, 0);
                })
                .value();

            var chartData = {
                labels: labels,
                series: [overtimeSeries, workedSeries]
            };

            const lastYear = _(partitioned[0]).filter(x => !moment(x.start).isAfter(moment().subtract(1, 'year'))).value();
            resolve({
                chartData: chartData,
                totalLastYear: _(lastYear).map(x => x.dur).sum() / (1000 * 60 * 60),
                totalThisYear: _(partitioned[1]).map(x => x.dur).sum() / (1000 * 60 * 60)
            });
        })
    });
}

export async function getAllStats() {
    return new Promise(resolve => {

        // All time
        const db = new Datastore({ filename: 'toggl.db', autoload: true });

        const from_date = new Date(2007, 0, 1);
        const to_date = moment().endOf('year');

        db.find({ start: { $gte: from_date } }, async function (err, data) {

            const allTimeSourceData = _(data)
                .orderBy(x => new Date(x.start))
                .groupBy(x => {
                    const tempDate = new Date(x.start);
                    return 'Q' + moment(tempDate).quarter() + ' ' + tempDate.getUTCFullYear()
                });

            const workedSeries = allTimeSourceData.map((x, i) => _(x).map(y => y.dur).sum() / (1000 * 60 * 60)).value();
            const helper = new overtimeHelper();
            const overtime = await helper.getByDates(from_date, to_date);
            const overtimeSeries = _(allTimeSourceData)
                .chain()
                .map((x, k) => new Date(k))
                .map((x, i) => {
                    const overtimeForThisDay = _(overtime).filter(y => y.date.setHours(0) - x.setHours(0) === 0).first();
                    return workedSeries[i] - (overtimeForThisDay && overtimeForThisDay.overtime || 0);
                })
                .flatten()
                .value();

            var chartData = {
                labels: allTimeSourceData.map((x, k) => k).value(),
                series: [overtimeSeries, workedSeries]
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
        db.find({ start: { $gte: startDate } }, function (err, data) {
            resolve(_(data).orderBy(x => new Date(x.start)).reverse().value());
        });
    });
}