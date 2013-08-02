var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var mysql = require('mysql');
var querystring = require('querystring');
var session = require('sessions');
var events = require('events');
var util = require('util');
var bcrypt = require('bcrypt');
var Validator = require('validator').Validator;

var eventEmitter = new events.EventEmitter();

//catch all errors into this._errors array
Validator.prototype.error = function (msg) {
	this._errors.push(msg);
	return this;
}

//returns all errors from this._errors array
Validator.prototype.getErrors = function () { return this._errors; }

function startPage(response, request){ 
	console.log('Request handler "start" was called.');
	
	fs.readFile('files/html/login_page.html', function (error, data){
		if(error){
			response.writeHeader(500, {"Content-Type": "text/html"});  
			response.write("<h1>Internal Server Error!... All hope is lost. Abandon ship!... FML</h1>");    
		} else {
			response.writeHeader(200, {"Content-Type": "text/html"});  
			response.write(data);
		}
		response.end();
	});
}

function dashboard(response, request){  
	console.log("Request handler 'dashboard' was called.");
	
	fs.readFile('../../html/dashboard.html', function (error, data){
		if(error){
			response.writeHeader(500, {"Content-Type": "text/html"});  
			response.write("<h1>Internal Server Error!... All hope is lost. Abandon ship!... FML</h1>");    
		} else {
			response.writeHeader(200, {"Content-Type": "text/html"});  
			response.write(data);
		}
		response.end();
	});
}

function checkForExistingUser(username, password){
	//we have to send the password so we can send it on to the loginUser
	// if we register this user
	db.query(
		'SELECT username, hash FROM users WHERE username=?',
		[username],
		function (errors, results, fields) {
			if (errors) throw errors;

			//console.log(this.sql);
			//console.log(results);

			if (results.length === 0){
				badUserCheckResult = {
					'success': false,
					'message': ['There is no such user. Why not Register with us?']
					//this is an array since the front end expect the 'message' key
					// to be an array
				}
				eventEmitter.emit('loginResult', badUserCheckResult);
			} else {
				//pull out hashed password
				hash = results[0].hash;

				var match = bcrypt.compareSync(password, hash);
				if (match){
					goodPasswordResult = {
						'login_success' : true,
						'success' : true,
						'location': '/files/html/temp_index.html'
					}
					console.log('User checks out, we can log in');
					eventEmitter.emit('loginResult', goodPasswordResult);
				}
				else{
					badPasswordResult = {
						'success' : false,
						'message' : ['Incorrect Password.']
					}
					eventEmitter.emit('loginResult', badPasswordResult);
				}
			}
	});
}

function addUser(username, email, password){
	//Is there a sane way to do this asynchronously? Would I even want to?
	var hash = bcrypt.hashSync(password, 13); //Lucky 13!

	db.query('INSERT INTO users SET username=?, email=?, hash=?, created_at=NOW();',
		[username, email, hash],
		function (errors, results, fields) {
			if (errors) throw errors;

			//console.log(this.sql);
			goodInsertResult = {
				'success': true,
				'message': 'You are registered! Please log in.'
			}

			console.log("Registered: ");
			console.log(results);
			eventEmitter.emit('loginResult', goodInsertResult);
		});
}

function checkForDuplicateUser(username, email, password){
	//we have to include the password here, to send it on to the database
	// if we register this user
	db.query(
		'SELECT username, email FROM users WHERE username=? OR email=?',
		[username, email],
		function (errors, results, fields) {
			if (errors) throw errors;

			//console.log(this.sql);

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
				badDuplicateUserResult = {
					'success': false,
					'message': error_message
				}
				eventEmitter.emit('loginResult', badDuplicateUserResult);
			}
			else {
				noDuplicateUserResult = {
					'success': true
				}
				addUser(username, email, password);
			}
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
		badLoginDataResult = {
			'success' : false,
			'message' : errors
		}
		eventEmitter.emit('loginResult', badLoginDataResult);
	}
	else {
		console.log("Form information valid");
		checkForExistingUser(username, password);
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
		badRegistrationDataResult = {
			'success' : false,
			'message' : errors
		}
		eventEmitter.emit('loginResult', badRegistrationDataResult);
	}
	else
	{
		console.log("Form information valid");
		checkForDuplicateUser(username, email, password);
	}
}


exports.startPage = startPage;
exports.dashboard = dashboard;
exports.validateLoginData = validateLoginData;
exports.validateRegistrationData = validateRegistrationData;