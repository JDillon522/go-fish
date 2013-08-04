// Conducts all action for Login and Registration attempts. Logic is as follows:
// if Login: validateLoginData -> checkForExistingUser ->Login
// if Register: validateReisrationData -> checkForDuplicateUser -> addUser -> return success message

// ********************************************************************
// ISSUE TO FIX: We potentially dont need to have as much validation done 
// by node.js. Foundation has built in validation. We should look into this
// *********************************************************************

var session = require('sessions');
var events = require('events');
var bcrypt = require('bcrypt');
var Validator = require('validator').Validator;
var eventEmitter = new events.EventEmitter();

//catch all errors into this._errors array
Validator.prototype.error = function (msg) {
	this._errors.push(msg);
	return this;
}

//returns all errors from this._errors array
Validator.prototype.getErrors = function () { 
	return this._errors; }


// Login functions:
function validateLoginData(username, password, db, response, session){
	// Listening for 'loginResult' event emitted from var from 
	// function varifyLoginData and function checkForExistingUser 
	eventEmitter.once('loginResult', function (result){
		//set the session variables, login the user
		console.log('loginResult triggered!');
		console.log(result);
		if(result.login_success){
			session.set('isLoggedIn', true);
			session.set('user', {
				'username': username
			});
		}
		//send back the result to the login form
		response.end(JSON.stringify(result));
	});

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
		console.log("Emitting 'loginResult'");
		eventEmitter.emit('loginResult', badLoginDataResult);
	}
	else {
		console.log("Form information valid");
		checkForExistingUser(username, password, db);
	}
}

function checkForExistingUser(username, password, db, response){
	//we have to send the password so we can send it on to the loginUser
	// if we register this user
	db.query(
		'SELECT username, hash FROM users WHERE username=?',
		[username],
		function (errors, results, fields) {
			if (errors) throw errors;

			if (results.length === 0){
				badUserCheckResult = {
					'success': false,
					'message': ['There is no such user. Why not Register with us?']
					//this is an array since the front end expect the 'message' key
					// to be an array
				}
				console.log("Emitting 'loginResult'");
				eventEmitter.emit('loginResult', badUserCheckResult);
			} else {
				//pull out hashed password
				hash = results[0].hash;

				var match = bcrypt.compareSync(password, hash);
				if (match){
					goodPasswordResult = {
						'login_success' : true,
						'success' : true,
						'location': '/files/html/dashboard.html'
					}
					console.log('User checks out, we can log in');
					console.log("Emitting 'loginResult'");
					eventEmitter.emit('loginResult', goodPasswordResult);
				}
				else{
					badPasswordResult = {
						'success' : false,
						'message' : ['Incorrect Password.']
					}
					console.log("Emitting 'loginResult'");
					eventEmitter.emit('loginResult', badPasswordResult);
				}
			}
	});
}

// Registration functions: 
function validateRegistrationData(username, email, password, confirm_password, db, response){
	// Listening for 'loginResult' event emitted from var from 
	// function varifyLoginData and function checkForExistingUser 
	eventEmitter.once('loginResult', function (result){
		//send back the result to the registration form
		response.end(JSON.stringify(result));
	});

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
		console.log("Emitting 'loginResult'");
		eventEmitter.emit('loginResult', badRegistrationDataResult);
	}
	else
	{
		console.log("Form information valid");
		checkForDuplicateUser(username, email, password, db);
	}
}

function checkForDuplicateUser(username, email, password, db, response){
	//we have to include the password here, to send it on to the database
	// if we register this user
	db.query('SELECT username, email FROM users WHERE username=? OR email=?', [username, email], function (errors, results, fields) {
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
			console.log("Emitting 'loginResult'");
			eventEmitter.emit('loginResult', badDuplicateUserResult);
		}
		else {
			noDuplicateUserResult = {
				'success': true
			}
			addUser(username, email, password, db);
		}
	});
}

function addUser(username, email, password, db, response){
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
		console.log("Emitting 'loginResult'");
		eventEmitter.emit('loginResult', goodInsertResult);
	});
}

exports.validateLoginData = validateLoginData;
exports.validateRegistrationData = validateRegistrationData;


// Written by India Meisner - india.rae@gmail.com - GitHub: india518
// Compiled by Joseph Dillon - joseph.dillon.522@gmail.com - GitHub: JDillon522