var querystring = require('querystring');
var fs = require('fs');
var formidable = require('formidable');

function startPage(response, postData){ 
	console.log('Request handler "start" was called.');
	
	var body = '<html>' +
		'<head>' + 
		'<meta http-equiv="Content-Type" content=" text/html; charset=UTF-8" />' +
		 '</head>' +
		 '<body>' +
			'<form action="/upload" enctype="multipart/form-data" method="post">' + '<input type="file" name="upload">' + 
				'<input type="submit" value="Upload File" />' + 
		 	'</form>' + 
 		'</body>' + 
	'</html>';

	response.writeHead(200, {'Content-Type' : 'text/html'});
	response.write(body);
	response.end();
}

function upload(response, request){  
	console.log("Request handler 'upload' was called.");
	
	var form = new formidable.IncomingForm();
	console.log('About to Parse...');
	form.parse(request, function (error, fields, files){
		console.log('Parsing Done');
		fs.rename(files.upload.path, 'temp/test.png', function (error){
			if (error){
				fs.unlink('temp/test.png');
				fs.rename(files.upload.path, 'temp/test.png');
			}
		});
		response.writeHead(200, {'Content-Type' : 'text/html'});
		response.write("Received Image:<br/>"); 
		response.write('<img src="/show" />');
		response.end();
	})
	
}

function show(response){
	console.log('Request handler "show" was called.');
	response.writeHead(200, {'Content-Type': 'image/png'});
	fs.createReadStream('temp/test.png').pipe(response);
}

exports.startPage = startPage;
exports.upload = upload;
exports.show = show;