'use strict';

const logger = require('winston').loggers.get('server');

module.exports = function MongoErrorHandler(err, req, res, next) {
  if(err.name !== 'MongoError') return next(err);

  logger.verbose(err.message);
  res.status(404);
  if(err.message.includes('not opened for writing')) {
    return res.json({success: false, message: 'Paste not found'});
  }
  res.json({success: false, message: err.message});
};
