'use strict';

const logger = require('winston').loggers.get('server');
const ArgumentError = require('../error/argument-error');

function ArgumentErrorHandler(err, req, res, next) {
  if(err instanceof ArgumentError) {
    logger.verbose('Failed to create paste:', err.message);
    res.json({success: false, message: err.message});
  } else{
    next(err);
  }
}

module.exports = ArgumentErrorHandler;