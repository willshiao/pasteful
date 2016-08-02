'use strict';
const router = require('express').Router();
const bodyParser = require('body-parser');
const busboy = require('connect-busboy');

const _ = require('lodash');
const Paste = require('../models/paste');
const config = require('config');
const shortid = require('shortid');
const logger = require('winston').loggers.get('server');
const dbLogger = require('winston').loggers.get('db');
const gfs = require('../lib/gfs').gfs;
const db = require('../lib/gfs').conn.db;
const fs = require('fs');

const LargePaste = require('../lib/class/large-paste');

const Errors = require('../lib/errors');
const ArgumentError = Errors.ArgumentError;
const NotFoundError = Errors.NotFoundError;

router.use(bodyParser.json());
router.use(bodyParser.text());
router.use(bodyParser.urlencoded({extended: false}));

const bb = busboy({
  immediate: true,
  limits: {
    fileSize: config.get('paste.large.maxSize'),
    files: 1
  }
});

//***************
// Routes
//***************

router.get('/', (req, res) => {
  res.type('text');
  res.send('OK');
});

router.post('/', newPaste);
router.post('/new', newPaste);
router.post('/pastes/new', newPaste);
router.post('/large/new', bb, newGfsPaste);

router.get('/pastes/recent', getRecentPastes);
router.get('/large/recent', getGfsRecentPastes);

router.get('/:id', getPaste);
router.get('/pastes/:id', getPaste);
router.get('/large/:id', getGfsPaste);


function newPaste(req, res, next) {
  if(req.is('text/plain')) {
    if(req.body.length <= 0) next(new ArgumentError('No content found'));
    if(Buffer.byteLength(req.body, 'utf8') > config.get('paste.maxSize'))
      return next(new ArgumentError('Paste too large.'));
    Paste.newPaste({
      content: req.body,
      ip: req.ip
    })
    .save()
    .then(saved => {
      res.type('text');
      res.send(config.get('server.url')+'/'+saved.slug);
    })
    .catch(err => {
      logger.error('Error creating paste:', err);
      next(err);
    });
  } else {
    if(!req.body.content)
      return next(new ArgumentError('No content field found'));
    if(Buffer.byteLength(req.body.content, 'utf8') > config.get('paste.maxSize'))
      return next(new ArgumentError('Paste too large.'));

    Paste.newPaste(req.body).save()
    .then(saved => {
      res.json({
        success: true,
        url: config.get('server.url')+'/'+saved.slug
      });
    })
    .catch(err => {
      logger.error('Error creating paste:', err);
      next(err);
    });
  }
}

function newGfsPaste(req, res, next) {
  if(!(req.is('application/x-www-formurlencoded') || req.is('multipart/*'))) return next();
  if(!req.busboy) return next(new ArgumentError('File upload not found.'));
  
  const fields = {};

  req.busboy.on('field', (key, val, keyTrunc, valTrunc) => {
    fields[key] = val;
  });

  req.busboy.on('file', (fieldName, fileStream, fileName, encoding, mimetype) => {
    if(fileStream.truncated) {
      logger.debug('File truncated');
      return next(new ArgumentError('Paste was too large.'));
    }

    let tooLarge = false;
    const lp = new LargePaste({
      fileName: shortid.generate(),
      ip: req.ip,
      title: fields.title || 'Untitled'
    });
    const saveStream = lp.getWriteStream();

    fileStream.on('limit', () => {
      logger.warn('File size exceeded limit.');
      tooLarge = true;
      saveStream.destroy('too large');
    });

    saveStream.on('close', paste => {
      if(tooLarge) {
        logger.silly('Paste was too large, deleting...');
        LargePaste.delete(paste).then(() => {
          logger.silly('Paste deleted.');
        });
        return next(new ArgumentError('Paste too large.'));
      }
      logger.debug('File stream closed.');
      return res.json({
        success: true,
        url: config.get('server.url')+'/large/'+paste.metadata.slug
      });
    });

    saveStream.on('error', err => {
      if(err.message !== 'too large') {
        dbLogger.error('Error saving paste: ', err);
      }
    });

    fileStream.pipe(saveStream);
  });

  req.busboy.on('filesLimit', () => {
    logger.warn('User attempted to upload more than 1 file.');
  });
}

function getPaste(req, res, next) {
  const id = req.params.id;
  if(!shortid.isValid(id)) {
    return next(new NotFoundError('Paste not found'));
  } else {
    Paste.where('slug', id).findOneAndUpdate({$inc: {'views': 1}})
    .lean().exec().then(paste => {
      res.type('text');
      res.send(paste.content);
    }).catch(err => {
      next(new NotFoundError('Paste not found'));
    });
  }
};

function getRecentPastes(req, res, next) {
  Paste.getRecent(10)
  .then(results => {
    res.json(results);
  }).catch(err => {
    logger.error(err);
    next(err);
  });
}

function getGfsPaste(req, res, next) {
  const id = req.params.id;
  LargePaste.getView(id)
  .then(strm => {
    res.type('text');
    strm.setEncoding('utf8');
    strm.pipe(res);
    strm.on('error', next);
  });
}

function getGfsRecentPastes(req, res, next) {
  LargePaste.getRecent(10)
  .then(data => {
    res.json(data);
  }).catch(next);
}

module.exports = router;