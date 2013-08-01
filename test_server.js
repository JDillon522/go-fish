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

		//if adding client
		if(pageUrl === '/register'){

			//console.log("We've hit the registration button");

			var dataQuery = url.parse(request.url).query;
			var formData = querystring.parse(dataQuery);

			console.log(formData);

			validateRegistrationData(formData.register_username, formData.register_email, formData.register_password, formData.confirm_password);

			//redirect to login.js and send 'formData' info with it?

		}
		else if(pageUrl === '/login'){

			console.log("We've hit the login button!");

			var dataQuery = url.parse(request.url).query;
			var formData = querystring.parse(dataQuery);

			validateLoginData(formData.login_username, formData.login_password);

			//redirect to login.js and send 'formData' info with it?
			
		}
		//else if(other path for other pages?){}
		else{
			//just logging in for now
			if (pageUrl === '/')
				filePath = 'login_page.html';
			// else if (__dirname === 'Foundation')
			// 	file_path = 
			else{
				filePath = __dirname + pageUrl;
				//console.log(__dirname + pageUrl);
			}

			//loading static files
			var tmp = filePath.lastIndexOf('.'); //set tmp='.' in file_path string
			var ext = filePath.substring(tmp + 1); //gets part of string AFTER '.'
																							//so, extension of the file

			// HERE is where we FINALLY start our response object!
			//first lets tackle an image
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

// function clientIsNew(db, email){
// 	var query = db.query('SELECT * FROM clients WHERE email=?', [email],
// 		function (errors, results, fields) {
// 			if (errors) throw errors;

// 			console.log(this.sql);

// 			if (results.length > 0){
// 				query_result = {
// 					'success': false,
// 					'message': ['There is already a client with this email address!']
// 				}
// 			}
// 			else {
// 				query_result = {
// 					'success': true,
// 					'message': 'This is a unique user'
// 				};
// 			}

// 			console.log(query_result.message);

// 			eventEmitter.emit('clientIsNewResult', query_result);
// 	});
// }

function addClient(db, first_name, last_name, email){
	db.query('INSERT INTO clients SET first_name=?, last_name=?, email=?, created_at=NOW();',
		[first_name, last_name, email],
		function (errors, results, fields) {
			if (errors) throw errors;

			console.log(this.sql);

			insert_result = {
				'success': true,
				'message': 'Client is added'
			}

			console.log("Inserted this client into database: ");
			console.log(results);

			eventEmitter.emit('addClientResult', insert_result);
		}
	);

}

function validateLoginData(username, password){
	var validator = new Validator();

	validator.check(username, {
		notEmpty: 'Username field cannot not be empty.',
		len: 'Username should be between 3 and 13 characters.'
	}).notEmpty().len(3, 13);

	validator.check(password, {
		notEmpty: 'Password field cannot be empty',
		len: 'Password must be at least 5 charcters long'
	}).notEmpty().len(5);

	var errors = validator.getErrors(); //returns an ARRAY of error messages

	if (errors.length > 0){
		console.log(errors);
	}
	else
	{
		console.log("Form information valid");
		//console.log(checkUser(login_username, login_password));
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
	}
	else
	{
		console.log("Form information valid");
		//console.log(checkUser(first_name, last_name, email));
	}
}

console.log('Server running at http://localhost:8080/');
