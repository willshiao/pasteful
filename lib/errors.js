'use strict';

const ArgumentError = require('./error/argument-error');
const NotFoundError = require('./error/not-found-error');

module.exports = {
  ArgumentError: ArgumentError,
  NotFoundError: NotFoundError
};