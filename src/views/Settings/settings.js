var Datastore = require('nedb');

export default class SettingsService {
    constructor() {
        this.db = new Datastore({ filename: 'settings.db', autoload: true });
        this.db.ensureIndex({ fieldName: 'id' }, function (err) {
        });
    }

    async set(settings) {
        return new Promise(async resolve => {

            this.db.find({ id: 1 }, (err, docs) => {
                if (docs.length === 0) {
                    this.db.insert({ ...settings, id: 1 }, function (err, newDocs) {
                        resolve(newDocs);
                    });
                }
                else {
                    this.db.update({ id: 1 }, { ...settings, id: 1 }, function (err, newDocs) {
                        resolve(newDocs);
                    });
                }
            });
        })
    }

    async get() {
        return new Promise(async resolve => {
            this.db.findOne({ id: 1 }, function (err, docs) {
                resolve(docs || {});
            });
        })
    }
}