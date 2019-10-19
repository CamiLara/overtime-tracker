import _ from 'lodash';
import togglClient from './togglClient';
// Type 3: Persistent datastore with automatic loading
var Datastore = require('nedb');

export default class TogglImporter {
    constructor() {
        this.db = new Datastore({ filename: 'toggl.db', autoload: true })
    }

    async import() {
        const client = new togglClient();
        const allTimeData = await client.fetchPagedTimeEntries(new Date(2019, 0, 1), new Date());
        debugger;
        this.db.insert(allTimeData, function (err, newDocs) {
            // Two documents were inserted in the database
            // newDocs is an array with these documents, augmented with their _id
        });
    }

    get() {
        return new Promise(resolve => {
            this.db.find({}, function (err, docs) {
                resolve(docs);
            });
        })
    }
}