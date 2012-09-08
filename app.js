
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.helpers({
    title: 'Node-Neo4j Template'    // default title
});

// Routes

app.get('/', routes.site.index);

app.get('/users', routes.users.list);
app.post('/users', routes.users.create);
app.get('/users/:id', routes.users.show);
app.post('/users/:id', routes.users.edit);
app.del('/users/:id', routes.users.del);
app.post('/users/:id/follow', routes.users.follow);
app.post('/users/:id/unfollow', routes.users.unfollow);

app.get('/streets', routes.streets.list);
app.post('/streets', routes.streets.create);
app.get('/streets/:id', routes.streets.show);
app.post('/streets/:id', routes.streets.edit);
app.del('/streets/:id', routes.streets.del);
app.post('/streets/:id/follow', routes.streets.follow);
app.post('/streets/:id/unfollow', routes.streets.unfollow);

app.get('/streetname/:name', routes.streets.byname);
app.get('/streetlist/:id', routes.streets.streetlist);
app.get('/streetidlist/:id', routes.streets.streetidlist);

app.get('/points', routes.points.list);
app.post('/points', routes.points.create);
app.get('/points/:id', routes.points.show);
app.post('/points/:id', routes.points.edit);
app.del('/points/:id', routes.points.del);
app.post('/points/:id/follow', routes.points.follow);
app.post('/points/:id/unfollow', routes.points.unfollow);

app.get('/numbers/:streetid', routes.points.getNumbers);
app.get('/demolished/:streetid', routes.points.getDemolished);

app.get('/network/:streetid', routes.points.getNetwork);

app.listen(process.env.PORT || 3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
