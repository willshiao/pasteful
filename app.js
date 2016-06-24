//Dependencies
const restify = require('restify');
const config = require('config');
const sid = require('shortid');
const mongoose = require('mongoose');
const winston = require('winston');
mongoose.Promise = require('bluebird');

//Load loggers
require('./lib/logger');

//Load server serverLogger
const serverLogger = winston.loggers.get('server');
const dbLogger = winston.loggers.get('db');


//Set shortid settings
if(config.get('paste.seed') !== null) {
  serverLogger.debug('shortid seed set to '+config.get('paste.seed')+'.');
  sid.seed(config.get('paste.seed'));
} else {
  serverLogger.debug('Using default shortid seed.');
}

//Connect to mongoose
dbLogger.debug('Connecting to mongoDB...');
mongoose.connect(config.get('db.uri'), config.get('db.options'));
dbLogger.debug('Connected!');

//Server Initialization
const app = restify.createServer({
  name: config.get('server.name')
});

//Register middleware
app.use(restify.queryParser({mapParams: false}));
app.use(restify.bodyParser());

//Apply routes
require('./routes/index.js')(app);

//Bind to port
app.listen(config.get('server.port'));
serverLogger.info('Listening on port ' + config.get('server.port'));