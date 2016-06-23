//******************************
// Logger module using Winston
//******************************
const winston = require('winston');
const config = require('config');
const RotateTransport = require('winston-daily-rotate-file');


const server = config.get('logger.server');
winston.loggers.add('server', {
  console: server.console,
  transports: [server.logToFile ?
    new RotateTransport(server.file) : null]
});

const db = config.get('logger.db');
winston.loggers.add('db', {
  console: db.console,
  transports: [db.logToFile ?
    new RotateTransport(db.file) : null]
});

const cache = config.get('logger.cache');
winston.loggers.add('cache', {
  console: cache.console,
  transports: [cache.logToFile ?
    new RotateTransport(cache.file) : null]
});