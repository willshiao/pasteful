const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const config = require('config');
const Promise = require('bluebird');
const deasync = require('deasync');
Grid.mongo = mongoose.mongo;
Promise.promisifyAll(mongoose.mongo);

const conn = mongoose.createConnection(config.get('db.uri'));
var gfs;
var opened = false;

conn.once('open', () => {
  gfs = Promise.promisifyAll(Grid(conn.db));
  opened = true;
});

deasync.loopWhile(() => !opened);

module.exports = {
  gfs: gfs,
  conn: conn
};
