// Routes all requests from the page. All attached CSS, JS, and image files
// are evaluated here. 

//*****************************************************************
// ISSUE TO FIX: refractor the massive if/else if/else statement. Tis a nasty ting
//******************************************************************

var http = require('http');
var querystring = require('querystring');
var fs = require('fs');
var url = require('url');

function route(handle, pathname, response, request){
	// determines if the pathname fits into the handle declared on the index.js page
	if (typeof handle[pathname] === "function"){		
		handle[pathname](response, request);
		} else {
		// Loads all attached files (CSS, JS, images)
		var file_path = "";
		// parses the url request for a file and pulls the pathname. This has to be
		// done again because only the pathname for the main html file was passed down
		var url_request = url.parse(request.url).pathname;  	
		var tmp  = url_request.lastIndexOf(".");
		var extension  = url_request.substring((tmp + 1));
		file_path = url_request.replace("/", "");

		//load needed static files
		fs.readFile(file_path, function (error, contents){
			if(error){
				console.log('Eff, a sub file didnt load right');
				console.log(error);
				response.writeHead(500, {"Content-Type": "text/html"});  
				response.end();    
			} else { 
				// set content type
				if (extension === 'html') response.writeHead(200, {"Content-Type": 'text/html'});
				else if (extension === 'htm') response.writeHead(200, {"Content-Type": 'text/html'});
				else if (extension === 'css') response.writeHead(200, {"Content-Type": 'text/css'});
				else if (extension === 'js') response.writeHead(200, {"Content-Type": 'application/javascript'});
				else if (extension === 'png') response.writeHead(200, {"Content-Type": 'image/png'});
				else if (extension === 'jpg') response.writeHead(200, {"Content-Type": 'image/jpg'});
				else if (extension === 'jpeg') response.writeHead(200, {"Content-Type": 'image/jpeg'});
				else if (extension === 'ico') response.writeHead(200, {"Content-Type": 'image/x-icon'});
				else { console.log("NO CORRECT EXTENSION")};
				response.end(contents);
			}
			response.end();  
		});
	}
}

exports.route = route;

// Written by Joseph Dillon - joseph.dillon.522@gmail.com - GitHub: JDillon522