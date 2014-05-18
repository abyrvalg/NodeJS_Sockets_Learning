
/**
 * Module dependencies.
 */

var express = require('express'),
   routes = require('./routes'),
   user = require('./routes/user'),
   http = require('http'),
   path = require('path');   
	
var app = express(),
	server = http.createServer(app),	
	pong = require('./pong');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users/:uid?', user.list);



server.listen(app.get('port'), function(){	
	pong.start(server);
});
