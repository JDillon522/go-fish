var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var mysql = require('mysql');
var querystring = require('querystring');
var session = require('sessions');
var events = require('events');
var util = require('util');
var Validator = require('validator').Validator;

var sessionHandler = new session();
var eventEmitter = new events.EventEmitter();


// *** this may need to go in a separate file at some point:

//catch all errors into this._errors array
Validator.prototype.error = function (msg) {
	this._errors.push(msg);
	return this;
}

//returns all errors from this._errors array
Validator.prototype.getErrors = function () {
	return this._errors;
}

var db = mysql.createConnection({
					//host:'localhost',
					port: 8889,
					user: 'root',
					password: 'root',
					database: 'go_fish'
				});

db.connect(function(err) {
	if (err) throw err;
	console.log('Connection Successful');
});
// *******


testServer = http.createServer(function (request, response){
	//get the request url
	var pageUrl = url.parse(request.url).pathname;
	//console.log(pageUrl);

	//start nodejs session handling
	sessionHandler.httpRequest(request, response, function (err, session) 
	{

		if((pageUrl === '/register') || (pageUrl === '/login')){

			var dataQuery = url.parse(request.url).query;
			var formData = querystring.parse(dataQuery);

			eventEmitter.on('loginResult', function (result){

				//set the session variables, login the user
				if(result.success){
					session.set('is_logged_in', true);
					//get this from result
					session.set('user', {
						'username': result.username
					});
				}
				else{
					//Send response back to display message
					response.end(JSON.stringify(result));
				}

			});

			if(pageUrl === '/register'){
				validateRegistrationData(
					formData.register_username,
					formData.register_email,
					formData.register_password,
					formData.confirm_password);
			}
			else {
				validateLoginData(
					formData.login_username,
					formData.login_password);
			}
		}
		//else if(other path for other pages?){}
		else{
			//check if client is login
			if((session.get('is_logged_in') != true) && (pageUrl === '/'))
				filePath = 'login_page.html';
			else{
				filePath = __dirname + pageUrl;
			}
			console.log(filePath);

			//loading static files
			var tmp = filePath.lastIndexOf('.'); //set tmp='.' in file_path string
			var ext = filePath.substring(tmp + 1); //gets part of string AFTER '.'
																							//so, extension of the file

			// HERE is where we FINALLY start our response object!
			//first lets tackle an image?
			if(ext === 'jpeg'){

				response.writeHead(200, {'Content-type': 'image/jpeg'});

				// fs.stat(filePath, function (error, stat){
				// 	var readStream;

				// 	response.writeHead(200, {
				// 		'Content-type': 'image/jpeg',
				// 		'Content-Length': stat.size
				// 	});
				// 	readStream = fs.createReadStream(filePath);
				// 	//pump the file to the response
				// 	util.pump(readStream, response, function (error){
				// 		if(error){
				// 			throw error;
				// 		}
				// 	});
				// });

			}
			else if(ext === 'js')
				response.writeHead(200, {'Content-type': 'text/javascript'});
			else if(ext === 'css')
				response.writeHead(200, {'Content-type': 'text/css'});
			else
				response.writeHead(200, {'Content-type': 'text/html'});

			//this is for not reloading page twice: look into this more?
			if ((pageUrl != '/favicon.ico') && (ext != 'jpeg')) {
				fs.readFile(filePath, 'utf8', function (errors, contents){
					response.end(contents);
				});	
			}
			else
				response.end();
		}
	});
}).listen(8080);

function addUser(username, email, password){
	//first, hash the password
	//var hash = hashData(password);
	// for testing, for now:
	var hash = "kitty";
	db.query('INSERT INTO users SET username=?, email=?, hash=?, created_at=NOW();',
		[username, email, hash],
		function (errors, results, fields) {
			if (errors) throw errors;

			console.log(this.sql);

			insert_result = {
				'success': true,
				'message': 'User is registered',
				'location': '/temp_index.html'
			}

			console.log("Registered: ");
			console.log(results);

			eventEmitter.emit('addUserResult', insert_result);
		}
	);
}

function checkForUser(username, email, password){
	//we have to send the password so we can send it on to the database
	// if we register this user
	db.query(
		'SELECT username, email FROM users WHERE username=? OR email=?',
		[username, email],
		function (errors, results, fields) {
			if (errors) throw errors;

			//console.log(this.sql);
			console.log(results);

			//var query_username = fields[0].name;
			//var query_email = fields[1].name;
			var error_message = new Array();

			if (results.length > 0){
				for(i = 0; i < results.length; i++){
					if (results[i].username === username){
						error_message.push('This username is already taken.');
					}
					if (results[i].email === email){
						error_message.push('This email is already registered.');
					}
				}
				queryResult = {
					'success': false,
					'message': error_message
				}
				eventEmitter.emit('loginResult', queryResult);
			}
			else {
				queryResult = {
					'success': false,
					'message': error_message
				}
				addUser(username, email, password);
			}
			console.log(queryResult.message);
	});
}

function validateLoginData(username, password){
	var validator = new Validator();

	validator.check(username, {
		notEmpty: 'Username field cannot not be empty.',
		len: 'Username should be between 3 and 13 characters.'
	}).notEmpty().len(3, 13);

	validator.check(password, {
		notEmpty: 'Password field cannot be empty',
		len: 'Password must be at least 5 characters long'
	}).notEmpty().len(5);

	var errors = validator.getErrors(); //returns an ARRAY of error messages

	if (errors.length > 0){
		console.log(errors);
		//Have problems, bail out
		badResult = {
			'success' : false,
			'message' : errors
		}
		eventEmitter.emit('loginResult', badResult);
	}
	else {
		console.log("Form information valid");
		//console.log(findUser(username, password));
	}
}

function validateRegistrationData(username, email, password, confirm_password){
	var validator = new Validator();

	validator.check(username, {
		notEmpty: 'Username field cannot not be empty.',
		len: 'Username should be between 3 and 13 characters.'
	}).notEmpty().len(3, 13);

	validator.check(email, {
		notEmpty: 'Email field cannot not be empty.'
	}).notEmpty().isEmail();

	validator.check(password, {
		notEmpty: 'Password field cannot be empty.',
		len: 'Password must be at least 5 charcters long.'
	}).notEmpty().len(5);

	validator.check(confirm_password, {
		notEmpty: 'Confirm Password field cannot be empty.',
		equals: 'Confirm Password does not match Password.'
	}).notEmpty().equals(password);

	var errors = validator.getErrors(); //returns an ARRAY of error messages

	if (errors.length > 0){
		console.log(errors);
		//Have problems, bail out
		badResult = {
			'success' : false,
			'message' : errors
		}
		eventEmitter.emit('loginResult', badResult);
	}
	else
	{
		console.log("Form information valid");
		checkForUser(username, email);
	}
}

console.log('Server running at http://localhost:8080/');
