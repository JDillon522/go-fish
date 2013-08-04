// Main JS file. 'node index.js' to begin. All main custom modules are called
// and passed to the startServer function

var server = require('./server');
var router = require('./router');
var routeRequestHandlers = require('./routeRequestHandlers');
var login_register = require('./login_register');

var handle = { };
handle['/'] = routeRequestHandlers.startPage;
handle['/start'] = routeRequestHandlers.startPage;
handle['/dashboard'] = routeRequestHandlers.dashboard;


server.startServer(router.route, login_register.loginRegistration, handle);


// Written by Joseph Dillon - joseph.dillon.522@gmail.com - GitHub: JDillon522