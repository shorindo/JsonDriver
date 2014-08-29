/*
 * Copyright (C) 2014 Shorindo, Inc.
 *      http://shorindo.com
 *
 * Licensed under the Apache License, Version 2.0 (the &quot;License&quot;);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an &quot;AS IS&quot; BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var cq = {0:[]};
var http = require("http");
var url  = require("url");
var handlers = [];

/**
 * ハンドラーを設定する
 */
function addHandler(path, handler) {
	handlers.push({ regexp:new RegExp("^" + path.replace(/\*/g, ".*?") + "$"), handler:handler });
}

addHandler('/wd/hub/xdrpc', doClient);
addHandler('/wd/hub/target', doTarget);
for (var i = 2; i < process.argv.length; i++) {
	try {
		var text = require('fs').readFileSync(process.argv[i], 'utf-8');
		eval(text);
	} catch(err) {
		console.error(err);
	}
}
addHandler('/*', doResource);

http.createServer(function (request, response) {
	var reqline = request.method + " " + request.url;
	console.log(reqline + " from [" + request.client.remoteAddress + "]");
	var u = url.parse(request.url, true);
	for (var i = 0; i < handlers.length; i++) {
		if (handlers[i].regexp.test(u.pathname)) {
			handlers[i].handler(request, response);
			break;
		}
	}
}).listen(4444, function() {
	console.log("BIND TO '" + this.address().address + "'");
});

/**
 * セッションIDを取得する
 * @function
 * @param request
 * @returns
 */
function getSessionId(request) {
	var url  = require('url').parse(request.url);
	return url.pathname.replace(/^\/session\/(\d+)(\/.*)?$/, "$1");
}

/**
 * @param request
 * @param response
 */
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

/**
 * @param request
 * @param response
 */
function doNotFound(request, response) {
	response.writeHead(404, {"Content-Type": "text/plain"});
	response.end("NOT FOUND");
}

/**
 * @param request
 * @param response
 */
function doClient(request, response) {
	var json = "";
	var sid = getSessionId(request);
	switch (request.method) {
	case 'POST':
		request.on("data", function(data) {
			json += data;
		});
		request.on("end", function(evt) {
			var o = JSON.parse(json);
			console.log(cq[0].length + ":" + JSON.stringify(o));
			cq[0].push(new Queue(json, response));
		});
		break;
	default:
		response.writeHead(405, {"Content-Type" : "text/plain"});
		response.end("Method Not Allowed");
	}
}

function doTarget(request, response) {
	var json = request;
	var sid = getSessionId(request);
	switch(request.method) {
	case 'GET':
		var interval = setInterval(function() {
			if (cq[0].length > 0) {
				var q = cq[0][0];
				clearInterval(interval);
				response.writeHead(200, {
					"Access-Control-Allow-Origin" : "*",
					"Access-Control-Allow-Headers" : "Content-Type",
					"Access-Control-Allow-Methods" : "GET, POST, DELETE",
					"Allow" : "GET, POST, DELETE",
					"Conetnt-Type" : "application/json"
				});
				console.log(q.rpc);
				response.end(q.rpc);
			}
		}, 100);
		break;
	case 'POST':
		if (cq[0].length > 0) {
			var q = cq[0].shift();
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
				console.log(json);
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
		response.writeHead(405, {"Content-Type" : "text/plain"});
		response.end("Method Not Allowed");
	}
}

/**
 * @constructor
 * @param rpc
 * @param response
 * @returns
 */
function Queue(rpc, response) {
	var self = this;
	self.id = rpc.id = (new Date()).getTime();
	self.status = 0;
	self.start = (new Date()).getTime();
	self.rpc = rpc;
	self.response = response;
	self.timeout = setTimeout(function() {
		self.response.writeHead(504, {"Content-Type" : "text/plain"});
		self.response.end("Timeout");
	}, 10000);
	return self;
}
