import _ from 'lodash';
import togglClient from './togglClient';

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

export async function getMonthlyStats() {
    const client = new togglClient();
    var endDate = new Date();

    // This month
    const data = await client.fetchPagedTimeEntries(new Date(new Date().getFullYear(), new Date().getMonth(), 1), endDate)

    const sourceData = _(data).groupBy(x => {
        const tempDate = new Date(x.start);
        return new Date(
            tempDate.getUTCFullYear(),
            tempDate.getUTCMonth(),
            tempDate.getDay()
        );
    });

    var chartData = {
        labels: sourceData.map((x, k) => new Date(k).getDay()).orderBy(x => x).value(),
        series: [sourceData.map((x, i) => _(x).orderBy(y => new Date(y.start)).map(y => y.dur).sum() / (1000 * 60 * 60)).value()]
    };

    return chartData;
}

export async function getYearlyStats() {
    const client = new togglClient();
    var endDate = new Date();

    // This year
    const data = await client.fetchPagedTimeEntries(new Date(new Date().getFullYear(), 0, 1), endDate);
    const sourceData = _(data)
        .orderBy(x => new Date(x.start))
        .groupBy(x => {
            const tempDate = new Date(x.start);
            return new Date(tempDate.getUTCFullYear(), tempDate.getUTCMonth());
        });

    var chartData = {
        labels: sourceData.map((x, k) => formatMonth(new Date(k))).value(),
        series: [sourceData.map((x, i) => _(x).map(y => y.dur).sum() / (1000 * 60 * 60)).value()]
    };

    return chartData;
}

export async function getAllStats() {
    const client = new togglClient();
    var endDate = new Date();

    // All time
    var allTimeData = await client.fetchPagedTimeEntries(
        new Date(2018, 0, 1),
        endDate
    );

    const allTimeSourceData = _(allTimeData)
        .orderBy(x => new Date(x.start))
        .groupBy(x => {
            const tempDate = new Date(x.start);
            return new Date(tempDate.getUTCFullYear(), tempDate.getUTCMonth());
        });

    var chartData = {
        labels: allTimeSourceData.map((x, k) => formatMonth(new Date(k))).value(),
        series: [allTimeSourceData.map((x, i) => _(x).map(y => y.dur).sum() / (1000 * 60 * 60)).value()]
    };

    return chartData;
}

export async function getLatestEntries() {
    const client = new togglClient();

    // Latest entries
    var endDate = new Date();
    var startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    const data = await client.fetchPagedTimeEntries(startDate, endDate);

    return _(data).orderBy(x => new Date(x.start)).reverse().value();
}