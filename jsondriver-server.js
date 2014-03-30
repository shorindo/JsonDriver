/*
 * 
 */
var queue = [];
var http = require("http");
var url  = require("url");
http.createServer(function (request, response) {
	var reqline = request.method + " " + request.url;
	console.log(reqline + " from [" + request.client.remoteAddress + "]");
	var u = url.parse(request.url, true);
	switch(u.pathname) {
	case '/wd/hub/xdrpc':
		doClient(request, response);
		break;
	case '/wd/hub/target':
		doTarget(request, response);
		break;
	case '/webdriver.js':
	case '/jsondriver.js':
		doResource(request, response);
		break;
	default:
		doNotFound(request, response);
	}
}).listen(4444);

//test target server
http.createServer(function (request, response) {
	var reqline = request.method + " " + request.url;
	console.log("test:" + reqline + " from [" + request.client.remoteAddress + "]");
	doResource(request, response);
}).listen(8888);

function doResource(request, response) {
	var fs = require('fs');
	try {
		var url  = require('url').parse(request.url);
		var path = require('path');
		var fullpath = url.pathname.match(/^.*\/$/) ? url.pathname + "index.html" : url.pathname;
		var realpath = __dirname + path.normalize(fullpath);
		var text = fs.readFileSync(realpath, 'utf-8');
		switch(path.extname(realpath)) {
		case '.js':
			response.writeHead(200, {
				"Access-Control-Allow-Origin" : "*",
				"Access-Control-Allow-Headers" : "Content-Type",
				"Access-Control-Allow-Methods" : "GET, POST, DELETE",
				"Content-Type": "text/javascript"
			});
			if (request.headers.host) {
				text = text.replace("%BASE_URL%", "http://" + request.headers.host);
			}
			break;
		case '.css':
			response.writeHead(200, {"Content-Type": "text/css"});
			break;
		case '.html':
			response.writeHead(200, {
				"Access-Control-Allow-Origin" : "*",
				"Access-Control-Allow-Headers" : "Content-Type",
				"Access-Control-Allow-Methods" : "GET, POST, DELETE",
				"Content-Type": "text/html"
			});
			break;
		case '.png':
			response.writeHead(200, {"Content-Type": "image/png"});
			break;
		case '.jpg':
			response.writeHead(200, {"Content-Type": "image/jpeg"});
			break;
		case '.gif':
			response.writeHead(200, {"Content-Type": "image/gif"});
			break;
		default:
			response.writeHead(200, {"Content-Type": "text/plain"});
		}
		response.end(text);
	} catch (e) {
		doNotFound(request, response);
	}
}

function doNotFound(request, response) {
	response.writeHead(404, {"Content-Type": "text/plain"});
	response.end("NOT FOUND");
}
 
function doClient(request, response) {
	var json = "";
	switch (request.method) {
	case 'POST':
		request.on("data", function(data) {
			json += data;
		});
		request.on("end", function(evt) {
			queue.push(new Queue(json, response));
		});
		break;
	default:
		response.writeHead(405, {"Content-Type" : "text/plain"});
		response.end("Method Not Allowed");
	}
}

function doTarget(request, response) {
	switch(request.method) {
	case 'GET':
		var interval = setInterval(function() {
			if (queue.length > 0) {
				clearInterval(interval);
				queue[0].status = 1;
				response.writeHead(200, {
					"Access-Control-Allow-Origin" : "*",
					"Access-Control-Allow-Headers" : "Content-Type",
					"Access-Control-Allow-Methods" : "GET, POST, DELETE",
					"Allow" : "GET, POST, DELETE",
					"Conetnt-Type" : "application/json"
				});
				response.end(queue[0].rpc);
			}
		}, 100);
		break;
	case 'POST':
		if (queue.length > 0) {
			var q = queue.shift();
			var json = "";
			request.on("data", function(data) {
				json += data;
			});
			request.on("end", function(evt) {
				q.response.writeHead(200, {
					"Access-Control-Allow-Origin" : "*",
					"Access-Control-Allow-Headers" : "*",
					"Access-Control-Allow-Methods" : "*",
					"Allow" : "GET, POST, DELETE",
					"Conetnt-Type" : "application/json"
				});
				q.response.end(json);
				response.writeHead(200, {
					"Access-Control-Allow-Origin" : "*",
					"Access-Control-Allow-Headers" : "*",
					"Access-Control-Allow-Methods" : "*",
					"Allow" : "GET, POST, DELETE",
					"Content-Type" : "text/plain"
				});
				response.end("OK");
			});
		} else {
			response.writeHead(200, {
				"Access-Control-Allow-Origin" : "*",
				"Access-Control-Allow-Headers" : "*",
				"Access-Control-Allow-Methods" : "*",
				"Allow" : "GET, POST, DELETE",
				"Content-Type" : "text/plain"
			});
			response.end("NG");
		}
		break;
	case 'OPTIONS':
		response.writeHead(200, {
			"Content-Type" : "text/plain",
			"Allow" : "GET, POST, OPTIONS",
			"Access-Control-Allow-Origin" : "*",
			"Access-Control-Allow-Headers" : request.headers['access-control-request-headers'],
			"Access-Control-Allow-Methods" : "GET, POST, DELETE, OPTIONS"
		});
		response.end("");
		break;
	default:
		console.log("unknown:" + request.method);
		queue.shift();
		response.writeHead(405, {"Content-Type" : "text/plain"});
		response.end("Method Not Allowed");
	}
}

function Queue(rpc, response) {
	var self = this;
	self.status = 0;
	self.start = (new Date()).getTime();
	self.rpc = rpc;
	self.response = response;
	self.timeout = setTimeout(function() {
		self.response.writeHead(504, {"Content-Type" : "text/plain"});
		self.response.end("Timeout");
	}, 5000);
	return self;
}
