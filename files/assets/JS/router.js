var querystring = require('querystring');
var fs = require('fs');
var url = require('url');

function route(handle, pathname, response, request){
	console.log("About to route a request for " + pathname);

	if (typeof handle[pathname] === "function"){		
		handle[pathname](response, request);
		} else {

		console.log('NON HTML');
		console.log(pathname);

		var file_path = "";
		var mimes = {
			'css':  'text/css',
			'js':   'text/javascript',
			'htm':  'text/html',
			'html': 'text/html',
			'png': 'image/png',
			'jpg': 'image/jpg',
			'jpeg': 'image/jpeg'
		};
		
		// parses the url request for a file and pulls the pathname
		var url_request = url.parse(request.url).pathname;  	
		console.log('URL REQUEST');
		console.log(url_request);

		// finds the placement of '.' to determine the extension	
		var tmp  = url_request.lastIndexOf(".");
		// determines the extension by uing .substring that takes everything after '.'
		var extension  = url_request.substring((tmp + 1));
		console.log('EXTENSION');
		console.log(extension);


		//set path of static pages
		if (extension === 'css' || extension === 'js' || extension === 'htm' || extension === 'html' || extension === 'png' || extension === 'jpg' || extension === 'jpeg'){

			console.log('LOAD STATIC PAGE');
			file_path = url_request.replace("/", "");
			console.log(file_path);
			console.log();
		}

		//load needed pages and static files
		fs.readFile(file_path, function (error, data){
			console.log("AM I DEAD");
			if(error){
				console.log(error);
				response.writeHeader(500, {"Content-Type": "text/html"});  
				response.write("<h1>FS READ FILE ERROR: Internal Server Error!</h1>");    
			}
			else{
				response.writeHeader(200, {"Content-Type": mimes[extension]});  
				console.log(mimes[extension]);
				console.log(data);
				response.write(data);
			}

			response.end();  
		});
		response.end();
	}
}

exports.route = route;