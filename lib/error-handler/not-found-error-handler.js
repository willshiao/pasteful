'use strict';

const NotFoundError = require('../error/not-found-error');
const logger = require('winston').loggers.get('server');

module.exports = function NotFoundErrorHandler(err, req, res, next) {
  if(err instanceof NotFoundError) {
    logger.verbose(err.message);
    res.status(404);
    res.json({success: false, message: err.message});
  } else {
    next(err);
  }
};