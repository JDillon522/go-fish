// THIS IS AN EXPERIMENT..... it didnt work....yet

var events = require('events');
var session = require('sessions');

function loginResult (response) {
// Listening for 'loginResult' event emitted from var from 
	// function varifyLoginData and function checkForExistingUser 
	eventEmitter.once('loginResult', function (result){
		//set the session variables, login the user
		console.log('loginResult triggered!');
		if(result.login_success){
			session.set('isLoggedIn', true);
			session.set('user', {
				'username': formData.loginUsername
			});
		}
		//send back the result to the login form
		response.end(JSON.stringify(result));
	});
}

exports.loginResult = loginResult;