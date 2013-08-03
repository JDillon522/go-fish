var http = require('http');
var querystring = require('querystring');
var fs = require('fs');
var url = require('url');

function route(handle, pathname, response, request){
	console.log("About to route a request for " + pathname);

	if (typeof handle[pathname] === "function"){		
		handle[pathname](response, request);
		} else if (pathname === '/register' || pathname === '/login') {
			console.log('Register or Login');
		} else {

		var file_path = "";
		
		// parses the url request for a file and pulls the pathname
		var url_request = url.parse(request.url).pathname;  	
		var tmp  = url_request.lastIndexOf(".");
		var extension  = url_request.substring((tmp + 1));
			
		file_path = url_request.replace("/", "");

		//load needed pages and static files
		fs.readFile(file_path, function (error, contents){
			if(error){
				console.log('DIE!');
				console.log(error);
				response.writeHead(500, {"Content-Type": "text/html"});  
				response.end("<h1>FS READ FILE ERROR: Internal Server Error!</h1>");    
			}
			else{ 
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