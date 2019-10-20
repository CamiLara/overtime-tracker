import _ from 'lodash';
import togglClient from './togglClient';
import settingService from '../views/UserProfile/settings';

// Type 3: Persistent datastore with automatic loading
var Datastore = require('nedb');

export default class OvertimeHelper {
    constructor() {
        this.db = new Datastore({ filename: 'overtime.db', autoload: true })
        this.db.ensureIndex({ fieldName: 'id', unique: true }, function (err) {
        });
    }

    async save(overtime) {
        return new Promise(async resolve => {

            const overtimeToSave = { ...overtime, id: new Date(overtime.date).getTime() };

            this.db.find({ id: overtimeToSave.id }, (err, docs) => {
                if (docs.length === 0) {
                    this.db.insert(overtimeToSave, function (err, newDocs) {
                        resolve(newDocs);
                    });
                }
                else {
                    this.db.update({ id: overtimeToSave.id }, overtimeToSave, function (err, newDocs) {
                        resolve(newDocs);
                    });
                }
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

    getByDates(start, end) {
        return new Promise(resolve => {
            this.db.find({ date: { $gte: start }, date: { $lte: end } }, function (err, docs) {
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