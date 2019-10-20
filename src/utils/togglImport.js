import _ from 'lodash';
import togglClient from './togglClient';
import settingService from '../views/UserProfile/settings';

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
            const allTimeData = await client.fetchPagedTimeEntries(new Date(2007, 9, 1), new Date());

            const allTimeFormattedData = _(allTimeData).map(x => ({
                ...x,
                start: new Date(x.start),
                end: new Date(x.end)
            })).value();
            this.db.insert(allTimeFormattedData, function (err, newDocs) {
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