'use strict';

const gfs = require('./gfs').gfs;
const db = require('./gfs').conn.db;
const config = require('config');
const logger = require('winston').loggers.get('db');
const Promise = require('bluebird');


class PasteCleaner {

  constructor(interval, maxAge) {
    this.interval = interval;
    this.maxAge = maxAge;
    this.running = false;
  }

  _run() {
    const collection = db.collection('fs.files');
    logger.info(`Checking for old pastes...`);
    
    return collection.find({ uploadDate:
      {$lt : new Date(Date.now()-this.maxAge)}
    }, {_id: 1}).toArrayAsync()
    .then(pastes => {
      logger.debug(`Deleting ${pastes.length} pastes.`);
      return Promise.each(pastes, paste => {
        logger.silly(`Deleting paste with an ID of ${paste._id}`);
        return gfs.removeAsync(paste);
      });
    });
  }

  _runLoop() {
    if(!this.running) return false;
    this._run()
    .then(() => {
      this.timeoutId = setTimeout(this._runLoop, this.interval);
    });
  }

  start() {
    this.running = true;
    this._runLoop();
  }

  stop() {
    this.running = false;
    if(this.timeoutId) clearInterval(this.timeoutId);
  }
}

module.exports = PasteCleaner;