'use strict';

const net = require('net');

const config = require('config');
const shortid = require('shortid');
const Meter = require('stream-meter');
const logger = require('winston').loggers.get('socket');

const gfs = require('./gfs').gfs;
const LargePaste = require('./class/large-paste');


module.exports =
function() {
  if(!config.get('server.raw.enabled')) return;
  net.createServer(socket => {

    socket.setEncoding('utf8');
    socket.setTimeout(config.get('server.raw.timeout'));

    logger.verbose('new socket client connected');

    let tooLarge = false;
    const uniqueId = shortid.generate();
    const paste = new LargePaste({
      filename: uniqueId,
      createdBy: socket.remoteAddress,
      listed: false
    });
    const saveStream = paste.getWriteStream();

    saveStream.on('close', paste => {
      logger.silly('DB stream closed:', paste.metadata.slug);
      if(tooLarge) {
        logger.verbose('Paste was too large, deleting...');
        gfs.removeAsync(paste).then(() => logger.silly('Paste deleted.'));
      }
    });

    saveStream.on('error', err => {
      if(err.message === 'socket closed')
        logger.verbose('Paste saved to DB.');
      else
        logger.error('saveStream error:', err);
    });

    const meter = Meter(config.get('paste.maxSize'));
    socket.pipe(meter).pipe(saveStream);

    meter.on('error', err => {
      tooLarge = true;
      logger.verbose('Paste exceeded max file size: ', err);
      socket.write('Exceeded max file size of ' + config.get('paste.maxSize') + ' bytes.');
      socket.destroy();
    });

    socket.on('timeout', () => {
      const pasteUrl = config.get('server.url') + '/large/' + uniqueId;
      logger.debug('sending URL: ' + pasteUrl);
      socket.write(pasteUrl);
      socket.destroy();
    });

    socket.on('close', data => {
      saveStream.destroy('socket closed');
      logger.verbose('socket closed');
    });

    socket.on('error', err => {
      logger.error(err);
    });
  })
  .listen(config.get('server.raw.port'), () => {
    logger.info('Listening on port ' + config.get('server.raw.port'));
  });
};
