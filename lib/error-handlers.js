'use strict';
const ArgumentErrorHandler = require('./error-handler/argument-error-handler');
const NotFoundErrorHandler = require('./error-handler/not-found-error-handler');
const MongoErrorHandler = require('./error-handler/mongo-error-handler');

module.exports = {
  ArgumentErrorHandler: ArgumentErrorHandler,
  NotFoundErrorHandler: NotFoundErrorHandler,
  MongoErrorHandler: MongoErrorHandler
};