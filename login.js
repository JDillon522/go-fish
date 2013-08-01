var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var querystring = require('querystring');
var mysql = require('mysql');
var events = require('events');
var Validator = require('validator').Validator;

var sessionHandler = new session();
var eventEmitter = new events.EventEmitter();

// create login object here?

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


function clientIsNew(db, email){
	var query = db.query('SELECT * FROM clients WHERE email=?', [email],
		function (errors, results, fields) {
			if (errors) throw errors;

			console.log(this.sql);

			if (results.length > 0){
				query_result = {
					'success': false,
					'message': ['There is already a client with this email address!']
				}
			}
			else {
				query_result = {
					'success': true,
					'message': 'This is a unique user'
				};
			}

			console.log(query_result.message);

			eventEmitter.emit('clientIsNewResult', query_result);
	});
}

function addClient(db, first_name, last_name, email){
	//the only time we get here is to create the 'addClientReturn' event.
	//When do we create that event? AFTER checking the database for a 
	// duplicate entry!
	// DONT ASK about what would happen in between checking for a duplicate
	// and calling this function! Arg! One problem at a time!!
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

function validateData(first_name, last_name, email){
	var validator = new Validator();
	validator.check(first_name, {
		notEmpty: 'First Name field cannot not be empty.',
		isAlpha: 'Invalid characters: First Name should only contain letters.'
	}).notEmpty().isAlpha();
	validator.check(last_name, {
		notEmpty: 'Last Name field cannot not be empty.',
		isAlpha: 'Invalid characters: Last Name should only contain letters.'
	}).notEmpty().isAlpha();
	validator.check(email, {
		notEmpty: 'Email field cannot not be empty.'
	}).notEmpty().isEmail();

	var errors = validator.getErrors(); //returns an ARRAY of error messages

	if (errors.length > 0){
		result = {
		'success': false,
		'message': errors
		}
	}
	else
		result = {
		'success': true,
		'message': 'no duplicate user, yay!'
		};

	eventEmitter.emit('validateDataResult', result);
}
