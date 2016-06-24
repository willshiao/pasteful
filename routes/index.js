const Paste = require('../models/paste');
const config = require('config');
const shortid = require('shortid');
const logger = require('winston').loggers.get('db');

const IndexRoute = function(app) {

  app.get('/', (req, res, next) => {
    res.send('OK');
    next();
  });

  app.post('/new', (req, res, next) => {
    if(req.is('text/plain')) {
      var ip;
      if(config.get('server.proxied') === true) {
        ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      } else {
        ip = req.connection.remoteAddress;
      }
      if(req.body.length <= 0) {
        next(new Error('No content found.'));
      }
      var paste = Paste.newPaste({
        content: req.body,
        ip: ip
      });
      paste.save()
      .then(saved => {
        res.contentType = "text/plain";
        res.send(config.get('server.url')+'/'+saved.slug);
        next();
      })
      .catch(err => {
        logger.error('Error creating paste:', err);
        next(err);
      });
    } else {
      if(!req.params.content)
        next(new Error('No content field found.'));
      if(config.get('server.proxied') === true) {
        ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      } else {
        ip = req.connection.remoteAddress;
      }

      var paste = Paste.newPaste(req.params);
      paste.save()
      .then(saved => {
        res.json({
          success: true,
          url: config.get('server.url')+'/'+saved.slug
        });
        next();
      })
      .catch(err => {
        logger.error('Error creating paste:', err);
        next(err);
      });
    }
  });


  app.get('/paste/:id', getPaste);

  app.get('/:id', getPaste);
};

function getPaste(req, res, next) {
  const id = req.params.id;
  if(!shortid.isValid(id)) {
    return res.next(new Error('Paste not found.'));
  } else {
    Paste.where('slug', id).findOneAndUpdate({$inc: {'views': 1}})
    .lean().exec().then(paste => {
      res.contentType = 'text/plain';
      res.send(paste.content);
      next();
    }).catch(err => {
      logger.error('Error finding paste:', err);
      next(new Error('Paste not found.'));
    });
  }
};

module.exports = IndexRoute;