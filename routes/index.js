'use strict';
const router = require('express').Router();
const bodyParser = require('body-parser');

const Paste = require('../models/paste');
const config = require('config');
const shortid = require('shortid');
const logger = require('winston').loggers.get('db');

const Errors = require('../lib/errors');
const ArgumentError = Errors.ArgumentError;
const NotFoundError = Errors.NotFoundError;

router.use(bodyParser.json());
router.use(bodyParser.text());
router.use(bodyParser.urlencoded({extended: false}));


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

router.get('/recent', getRecentPastes);
router.get('/pastes/recent', getRecentPastes);

router.get('/:id', getPaste);
router.get('/pastes/:id', getPaste);



function newPaste(req, res, next) {
  if(req.is('text/plain')) {
    if(req.body.length <= 0) next(new ArgumentError('No content found'));

    Paste.newPaste({
      content: req.body,
      ip: req.ip
    }).save()
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

module.exports = router;