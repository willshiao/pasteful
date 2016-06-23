const IndexRoute = function(app) {

app.get('/', (req, res, next) => {
  res.send('OK');
  next();
});

};

module.exports = IndexRoute;