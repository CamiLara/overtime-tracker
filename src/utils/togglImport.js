import _ from 'lodash';
import settingService from '../views/Settings/settings';
import togglClient from './togglClient';

// Type 3: Persistent datastore with automatic loading
var Datastore = require('nedb');

export default class TogglImporter {
    constructor() {
        this.db = new Datastore({ filename: 'toggl.db', autoload: true })
        this.db.ensureIndex({ fieldName: 'id', unique: true }, function (err) {
        });
    }

    async import() {
        return new Promise(async resolve => {

            const svc = new settingService();
            const { apiKey, workspace } = await svc.get();
            const client = new togglClient(apiKey, workspace);

            const from_date = new Date(2007, 9, 1);
            var to_date = new Date();
            to_date.setDate(to_date.getDate() + 1);

            const allTimeData = await client.fetchPagedTimeEntries(from_date, to_date);
            const allTimeFormattedData = _(allTimeData).map(x => ({
                ...x,
                start: new Date(x.start),
                end: new Date(x.end)
            })).value();

            const allRecords = await this.get();
            const itemsToInsert = _(allTimeFormattedData).filter(x => !_.some(allRecords, y => y.id === x.id)).value();
            this.db.insert(itemsToInsert, function (err, newDocs) {
                resolve(newDocs);
            });
        })
    }

    get() {
        return new Promise(resolve => {
            this.db.find({}, function (err, docs) {
                resolve(docs);
            });
        })
    }

    reset() {
        return new Promise(resolve => {
            this.db.remove({}, { multi: true }, function (err, numRemoved) {
                resolve(numRemoved);
            })
        });
    }
}