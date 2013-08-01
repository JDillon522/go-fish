var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');

var handle = { };
handle['/'] = requestHandlers.startPage;
handle['/start'] = requestHandlers.startPage;
handle['/dashboard'] = requestHandlers.dashboard;


server.startServer(router.route, handle);

