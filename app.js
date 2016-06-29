'use strict';
//Load loggers
require('./lib/logger');

//Dependencies
const express = require('express');
const app = express();

const config = require('config');
const sid = require('shortid');
const mongoose = require('mongoose');
const winston = require('winston');
mongoose.Promise = require('bluebird');

const errorHandlers = require('./lib/error-handlers');
const errors = require('./lib/errors');

//Load server serverLogger
const serverLogger = winston.loggers.get('server');
const dbLogger = winston.loggers.get('db');
//Load routes
const indexRoute = require('./routes/index');

//Set shortid settings
if(config.get('paste.seed') !== null) {
  serverLogger.debug('shortid seed set to '+config.get('paste.seed')+'.');
  sid.seed(config.get('paste.seed'));
} else {
  serverLogger.debug('Using default shortid seed.');
}

//Connect to mongoose
dbLogger.debug('Connecting to mongoDB...');
mongoose.connect(config.get('db.uri'), config.get('db.options'));
dbLogger.debug('Connected!');

//Set app settings
app.set('trust proxy', config.get('server.trustProxy'));

//Register middleware

//Apply routes
app.use(indexRoute);
//Apply 404 handler
app.use((req, res, next) => {
  return next(new errors.NotFoundError('Page not found'));
});

//Bind error handlers
app.use(errorHandlers.ArgumentErrorHandler);
app.use(errorHandlers.NotFoundErrorHandler);


//Bind to port
app.listen(config.get('server.port'));
serverLogger.info('Listening on port ' + config.get('server.port'));