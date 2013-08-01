var querystring = require('querystring');
var fs = require('fs');
var url = require('url');

function startPage(response, request){ 
	console.log('Request handler "start" was called.');
	

	fs.readFile('../../html/login_page.html', function (error, data){
		if(error){
			response.writeHeader(500, {"Content-Type": "text/html"});  
			response.write("<h1>Internal Server Error!... All hope is lost. Abandon ship!... FML</h1>");    
		} else {
			console.log("successfully loaded")
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



exports.startPage = startPage;
exports.dashboard = dashboard;
