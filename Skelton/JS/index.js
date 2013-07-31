var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');

var handle = { };
handle['/'] = requestHandlers.startPage;
handle['/start'] = requestHandlers.startPage;
handle['/upload'] = requestHandlers.upload;
handle['/show'] = requestHandlers.show;

server.startServer(router.route, handle);

