'use strict';
const ArgumentErrorHandler = require('./error-handler/argument-error-handler');
const NotFoundErrorHandler = require('./error-handler/not-found-error-handler');

module.exports = {
  ArgumentErrorHandler: ArgumentErrorHandler,
  NotFoundErrorHandler: NotFoundErrorHandler
};