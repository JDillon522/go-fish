function route(handle, pathname, response, request){
	console.log("About to route a request for " + pathname);

	if (typeof handle[pathname] === "function"){
		handle[pathname](response, request);
		} else {
		console.log('No request handler found for ' + pathname);
		response.write("404 Not Found.");
		response.end();
	}
}

exports.route = route;