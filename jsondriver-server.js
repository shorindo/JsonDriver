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

function doSession(rpc, response) {
	//console.log("doSession()");
	var result = JSON.stringify({
		"sessionId":"9616c7f0-4a76-4213-99ac-2a9259d4a104",
		"status":0,
		"value":{
			"platform":"XP",
			"javascriptEnabled":true,
			"acceptSslCerts":true,
			"browserName":"firefox",
			"rotatable":false,
			"locationContextEnabled":true,
			"webdriver.remote.sessionid":"9616c7f0-4a76-4213-99ac-2a9259d4a104",
			"version":"27.0.1",
			"databaseEnabled":true,
			"cssSelectorsEnabled":true,
			"handlesAlerts":true,
			"browserConnectionEnabled":true,
			"webStorageEnabled":true,
			"nativeEvents":false,
			"applicationCacheEnabled":true,
			"takesScreenshot":true
		},
		"state":null,
		"class":"org.openqa.selenium.remote.Response",
		"hCode":1256523831
	});
	response.writeHead(200, {
		"Access-Control-Allow-Origin" : "*",
		"Content-Type" : "text/plain; charset=UTF-8",
		"Content-Length" : result.length
	});
	response.end(result);
}

/*
 * request:
 * {"method":"POST","path":"/session/de51c2c6-9701-498d-9624-7e3aceb734ef/url","data":{"url":"http://www.google.co.jp"}}
 * response:
 * {"sessionId":"de51c2c6-9701-498d-9624-7e3aceb734ef","status":0,"value":null,"state":"success","class":"org.openqa.selenium.remote.Response","hCode":1216466926}
 */
function doURL(rpc, response) {
	
}

/*
 * request:
 * {"method":"POST","path":"/session/de51c2c6-9701-498d-9624-7e3aceb734ef/element","data":{"using":"name","value":"q"}}
 * response:
 * {"sessionId":"de51c2c6-9701-498d-9624-7e3aceb734ef","status":0,"value":{"ELEMENT":"0"},"state":null,"class":"org.openqa.selenium.remote.Response","hCode":1648891393}
 * 
 */
function doElement(rpc, response) {
	
}

/*
 * request:
 * {"method":"POST","path":"/session/de51c2c6-9701-498d-9624-7e3aceb734ef/element/0/value","data":{"value":["webdriver"]}}
 * response:
 * {"sessionId":"de51c2c6-9701-498d-9624-7e3aceb734ef","status":0,"value":null,"state":null,"class":"org.openqa.selenium.remote.Response","hCode":1765695537}
 */
function doElementValue(rpc, response) {
	
}

/*
 * request:
 * {"method":"POST","path":"/session/de51c2c6-9701-498d-9624-7e3aceb734ef/element/1/click","data":{}}
 * response:
 * {"sessionId":"de51c2c6-9701-498d-9624-7e3aceb734ef","status":0,"value":null,"state":null,"class":"org.openqa.selenium.remote.Response","hCode":1910822332}
 */
function doElementClick(rpc, response) {
	
}

/*
 * request:
 * {"method":"POST","path":"/session/de51c2c6-9701-498d-9624-7e3aceb734ef/element","data":{"using":"name","value":"q"}}
 * response:
 * {"sessionId":"de51c2c6-9701-498d-9624-7e3aceb734ef","status":0,"value":{"ELEMENT":"0"},"state":null,"class":"org.openqa.selenium.remote.Response","hCode":1648891393}
 */
//functoin doElementSendkeys(rpc, response) {
//}

/*
 * request:
 * {"method":"GET","path":"/session/de51c2c6-9701-498d-9624-7e3aceb734ef/title","data":{}}
 * response:
 * {"sessionId":"de51c2c6-9701-498d-9624-7e3aceb734ef","status":0,"value":"Google","state":null,"class":"org.openqa.selenium.remote.Response","hCode":1404611098}
 */
function doTitle(rpc, response) {
	
}
