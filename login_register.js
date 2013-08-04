// acts as a "router" for the login and registration functions.

// *************************************************************************
// ISSUE TO FIX: session handling will have to be moved up to the server level 
// for socket.io as well as to ensure users are redirected when not logged in
// **************************************************************************

var http = require('http');
var url = require('url');
var querystring = require('querystring');
var session = require('sessions');
var loginRegisterHandlers = require('./loginRegisterHandlers');

var sessionHandler = new session();

function loginRegistration(response, request, db){
	var pageUrl = url.parse(request.url).pathname;
	//start node.js session handling
	sessionHandler.httpRequest(request, response, function (err, session) {
		if((pageUrl === '/register') || (pageUrl === '/login')){

			var dataQuery = url.parse(request.url).query;
			var formData = querystring.parse(dataQuery);

			// evalute data from /register and /login form and execute accordingly
			if(pageUrl === '/register'){
				loginRegisterHandlers.validateRegistrationData(
					formData.register_username,
					formData.register_email,
					formData.register_password,
					formData.confirm_password,
					db,
					response
					);
			} else {
				console.log(formData);
				loginRegisterHandlers.validateLoginData(
					formData.loginUsername,
					formData.login_password,
					db,
					response,
					session
					);
			}
		}

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
}

exports.loginRegistration = loginRegistration;

// Written by India Meisner - india.rae@gmail.com - GitHub: india518
// Compiled by Joseph Dillon - joseph.dillon.522@gmail.com - GitHub: JDillon522