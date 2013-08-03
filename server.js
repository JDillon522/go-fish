var http = require('http');
var url = require('url');
var fs = require('fs');
var mysql = require('mysql');
var events = require('events');
var querystring = require('querystring');
var session = require('sessions');
var requestHandlers = require('./requestHandlers');

var sessionHandler = new session();
var eventEmitter = new events.EventEmitter();


function startServer(route, handle) {
	function onRequest (request, response){
		// load pages
		var pathname = url.parse(request.url).pathname;
		console.log("request for " + pathname + " received.");
		route(handle, pathname, response, request);

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

		var pageUrl = url.parse(request.url).pathname;
		//start nodejs session handling
		sessionHandler.httpRequest(request, response, function (err, session) {
			if((pageUrl === '/register') || (pageUrl === '/login')){

				var dataQuery = url.parse(request.url).query;
				var formData = querystring.parse(dataQuery);

				// evalute data from /register and /login form and execute accordingly
				if(pageUrl === '/register'){
					requestHandlers.validateRegistrationData(
						formData.register_username,
						formData.register_email,
						formData.register_password,
						formData.confirm_password,
						db,
						response
						);
				} else {
					console.log(formData);
					requestHandlers.validateLoginData(
						formData.loginUsername,
						formData.login_password,
						db,
						response,
						session
						);
				}
			}
			// KEEP FOR INITAL TESTING. temp_index on .ready passes /get_username in order to prove session works
			// DELETE WHEN PROVED 
			else if (pageUrl === '/get_username'){
				//quick and dirty, probably not worth copying into production code :P
				username = session.get('user').username;
				result = { 'username' : username }
				//console.log("username: " + username);
				response.end(JSON.stringify(result));
			}
			// ^^^^ DELETE WHEN PROVED ^^^

			// LOGOUT, send result back to clients page, redirects to main page
			else if (pageUrl === '/logout'){
				session.set('isLoggedIn', false);
				session.set('user', {});
					response.end(
					JSON.stringify({
						'success': true,
						'location': '/'
					})
				);
			} else{
				//check if client is login
				if((session.get('isLoggedIn') != true)){
					filePath = __dirname + '/files/html/login_page.html';
				} else{
					filePath = __dirname + pageUrl;
					console.log("We're logged in if 'isLoggedIn' is: " + (session.get('isLoggedIn')));
				}
				console.log(filePath);
			}
		});
	};

	http.createServer(onRequest).listen(8000);
	console.log('Server is listening on port 8000.')
}

exports.startServer = startServer;