// Starts the server. All operations through the server are passed to their 
// respective functions. The goal is to keep the size of the files down for 
// easier debugging and refractoring. Only include the minimum needed to execute 
// a task. 

var http = require('http');
var url = require('url');
var mysql = require('mysql');
var io = require('socket.io');
function startServer(route, loginRegistration, handle) {
	// start connection to the Database
	var db = mysql.createConnection({
			port: 8889,
			user: 'root',
			password: 'root',
			database: 'go_fish'
		});
		db.connect(function(err) {
			if (err) throw err;
			console.log('Connection Successful');
		});
	// any time a change occurs and the server receives a request
	function onRequest (request, response){
		// Determine if there is a login or register request. If false, 
		// this will keep the server from wasting energy loading and 
		// checking the scripts.
		var pathname = url.parse(request.url).pathname;
		if (pathname === '/register' || pathname === '/login') {
			// deal with login and registration attempts
			loginRegistration(response, request, db);
		} else {
			// route and load pages
			route(handle, pathname, response, request);
		}	
	}
	//have socket io listen to server
	var sockets = io.listen(server);

	//listening to connection event
	sockets.on('connection', function (socket){
		//listening to send message event
		socket.on('message', function (message){
			//trigger display message event in all open sockets
			socket.broadcast.emit('add_message', message);
		});

	});

	var server = http.createServer(onRequest)
	server.listen(8000);
	console.log('Server is listening on port 8000.')
}

exports.startServer = startServer;

// Written by Joseph Dillon - joseph.dillon.522@gmail.com - GitHub: JDillon522