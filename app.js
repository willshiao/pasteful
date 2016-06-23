//Dependencies
const restify = require('restify');
const config = require('config');

//Load loggers
require('./lib/logger');

//Load server logger
const logger = require('winston').loggers.get('server');

//Initialization
const app = restify.createServer({
  name: config.get('server.name'),
  spdy: config.get('server.spdy')
});

//Apply routes
require('./routes/index.js')(app);

//Bind to port
app.listen(config.get('server.port'));
logger.info('Listening on port ' + config.get('server.port'));