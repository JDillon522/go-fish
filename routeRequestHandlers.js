// Executes necessary action to load the particular route. Its pretty straightforward

var fs = require('fs');

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

exports.startPage = startPage;
exports.dashboard = dashboard;


// Written by Joseph Dillon - joseph.dillon.522@gmail.com - GitHub: JDillon522