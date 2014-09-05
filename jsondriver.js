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
 
(function() {
/**
 * 初期化する
 * @function
 * @name	init
 */
var init = function() {
	var CLASS_NAME = "json.driver.Target";
	var BASE_URL = '%BASE_URL%';
	var founds = [];
	var COMMANDS = {
		'/status'											: doNotImplement,
		'/session'											: doNotImplement,
		'/sessions'											: doNotImplement,
		'/session/:sessionId'								: doSession,
		'/session/:sessionId/window'						: doNotImplement,
		'/session/:sessionId/window_handle'					: doNotImplement,
		'/session/:sessionId/window_handles'				: doNotImplement,
		'/session/:sessionId/url'							: doUrl,
		'/session/:sessionId/back'							: doBack,
		'/session/:sessionId/forward'						: doForward,
		'/session/:sessionId/refresh'						: doRefresh,
		'/session/:sessionId/cookie'						: doCookie,
		'/session/:sessionId/cookie/:name'					: doCookie,
		'/session/:sessionId/element'						: doElement,
		'/session/:sessionId/elements'						: doElement,
		'/session/:sessionId/element/active'				: doNotImplement,
		'/session/:sessionId/element/:id/element'			: doElementElement,
		'/session/:sessionId/element/:id/elements'			: doElementElement,
		'/session/:sessionId/element/:id/clear'				: doNotImplement,
		'/session/:sessionId/element/:id/click'				: doElementClick,
		'/session/:sessionId/element/:id/value'				: doElementValue,
		'/session/:sessionId/element/:id/submit'			: doNotImplement,
		'/session/:sessionId/element/:id/text'				: doElementText,
		'/session/:sessionId/element/:id/name'				: doElementName,
		'/session/:sessionId/element/:id/selected'			: doElementSelected,
		'/session/:sessionId/element/:id/enabled'			: doNotImplement,
		'/session/:sessionId/element/:id/displayed'			: doElementDisplayed,
		'/session/:sessionId/element/:id/location'			: doNotImplement,
		'/session/:sessionId/element/:id/size'				: doNotImplement,
		'/session/:sessionId/element/:id/attribute/:name'	: doElementAttribute,
		'/session/:sessionId/element/:id/css/:propertyName'	: doElementCssValue,
		'/session/:sessionId/element/:id/equals/:other'		: doNotImplement,
		'/session/:sessionId/window/:windowHandle/maximize'	: doNotImplement,
		'/session/:sessionId/window/:windowHandle/position'	: doNotImplement,
		'/session/:sessionId/window/:windowHandle/size'		: doNotImplement,
		'/session/:sessionId/frame'							: doNotImplement,
		'/session/:sessionId/frame/parent'					: doNotImplement,
		'/session/:sessionId/source'						: doSource,
		'/session/:sessionId/title'							: doTitle,
		'/session/:sessionId/execute'						: doExecute,
		'/session/:sessionId/execute_async'					: doNotImplement,
		'/session/:sessionId/screenshot'					: doNotImplement,
		'/session/:sessionId/ime/available_engines'			: doNotImplement,
		'/session/:sessionId/ime/active_engine'				: doNotImplement,
		'/session/:sessionId/ime/activated'					: doNotImplement,
		'/session/:sessionId/ime/deactivate'				: doNotImplement,
		'/session/:sessionId/ime/activate'					: doNotImplement,
		'/session/:sessionId/timeouts'						: doNotImplement,
		'/session/:sessionId/timeouts/async_script'			: doNotImplement,
		'/session/:sessionId/timeouts/implicit_wait'		: doNotImplement,
		'/session/:sessionId/click'							: doNotImplement,
		'/session/:sessionId/doubleclick'					: doNotImplement,
		'/session/:sessionId/buttondown'					: doNotImplement,
		'/session/:sessionId/buttonup'						: doNotImplement,
		'/session/:sessionId/moveto'						: doNotImplement,
		'/session/:sessionId/keys'							: doNotImplement,
		'/session/:sessionId/accept_alert'					: doNotImplement,
		'/session/:sessionId/dismiss_alert'					: doNotImplement,
		'/session/:sessionId/alert_text'					: doNotImplement,
		'/session/:sessionId/orientation'					: doNotImplement,
		'/session/:sessionId/log'							: doNotImplement,
		'/session/:sessionId/log/types'						: doNotImplement
	};
	var COMMANDS_EXPR = [];
	for (var key in COMMANDS) {
		var params = [];
		var replacer = function(str,p1,offset,s) {
			params.push(p1);
			return "([^\\/]+)";
		};
		COMMANDS_EXPR.push({
			regexp : new RegExp("^" + key.replace(/:([^\/]+)/g, replacer) + "$"),
			command : COMMANDS[key],
			params : params
		});
	}

	/**
	 * JsonServerに接続する
	 * @function
	 * @name	connect
	 */
	function connect() {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) { // DONE
				if (xhr.status == 200) { // OK
					log(">>" + xhr.responseText);
					var rpc = JSON.parse(xhr.responseText);
					try {
						doCommand(rpc);
						connect();
					} catch(e) {
						log("[E]" + jsonify(xhr));
						//doError(rpc, 9, e.toString(), 'UnknownError');
						setTimeout(connect, 5000);
					}
				} else {
					log("[E]" + jsonify(xhr));
					//doError(rpc, 9, xhr.statusText, 'UnknownError');
					setTimeout(connect, 5000);
				}
			}
		};
		xhr.onerror = function(err) {
			console.log("error:" + jsonify(err));
		};
		xhr.ontimeout = function(err) {
			console.log("timeout");
		};
		xhr.open("GET", BASE_URL + "/wd/hub/target");
		xhr.send();
	}
	
	/**
	 * ログ出力
	 * @function
	 * @name	log
	 */
	function log(text) {
		//var line = document.body.appendChild(document.createElement("div"));
		//line.appendChild(document.createTextNode(text));
		//console.log(text);
	}
	
	/**
	 * @function
	 * @name	jsonify
	 */
	function jsonify(o) {
		var seen=[];
		var jso = JSON.stringify(o, function(k,v){
		if (v instanceof Node) return '[node]';
		if (typeof v == 'object') {
			if ( !seen.indexOf(v) ) { return '__cycle__'; }
				seen.push(v);
			}
			return v;
		});
		return jso;
	}
	
	/**
	 * @function
	 * @name	geometry
	 */
	function geometry(e) {
		var result = { top:e.offsetTop, left:e.offsetLeft, width:e.offsetWidth, height: e.offsetHeight};
		var parent = e.offsetParent;
		while (parent) {
			result.top += parent.offsetTop;
			result.left += parent.offsetLeft;
			parent = parent.offsetParent;
		}
		return result;
	}
	
	function hilit(e) {
		var geo = geometry(e);
		var cover = document.body.appendChild(document.createElement("div"));
		cover.style.position = "absolute";
		cover.style.top = geo.top + "px";
		cover.style.left = geo.left + "px";
		cover.style.width = geo.width + "px";
		cover.style.height = geo.height + "px";
		cover.style.background = "yellow";
		cover.style.opacity = 0.5;
		cover.style.zIndex = 99999999;
		setTimeout(function() {
			cover.parentNode.removeChild(cover);
		}, 1000);
	}
	
	function response(obj, callback) {
		var result = jsonify(obj);
		var xhr = new XMLHttpRequest();
		if (typeof(callback) == 'function') {
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					callback();
				}
			};
		}
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
	}
	
	function newElementId(e) {
		var id = founds.length;
		founds.push(e);
		return String(id);
	}
//	function getSessionId(rpc) {
//		return rpc.path.replace(/^\/session\/([^\/]+).*$/, "$1");
//	}
	
	function getCommand(rpc) {
		return rpc.path.replace(/^.*?([^\/]+)$/, "$1");
	}
	
	function getElementId(rpc) {
		var result = rpc.path.replace(/^\/session\/([^\/]+)\/element\/(\d+)(\/.*)?$/, "$2");
		return result;
	}

	function getElementElementId(rpc) {
		var result = rpc.path.replace(/^\/session\/[^\/]+\/element\/[^\/]+\/element\/([^\/]+)(\/.*)?$/, "$1");
		return result;
	}
	
	function getCssName(rpc) {
		var result = rpc.path.replace(/^\/session\/([^\/]+)\/element\/([^\/]+)\/css\/([^\/]+)$/, "$3");
		return result;
	}

	function getAttributeName(rpc) {
		var result = rpc.path.replace(/^\/session\/([^\/]+)\/element\/([^\/]+)\/attribute\/([^\/]+)$/, "$3");
		return result;
	}

	function doCommand(rpc) {
		for (var i = 0; i < COMMANDS_EXPR.length; i++) {
			var matches = rpc.path.match(COMMANDS_EXPR[i].regexp);
			if (matches) {
				for (var j = 1; j < matches.length; j++) {
					rpc[COMMANDS_EXPR[i].params[j - 1]] = matches[j];
				}
				COMMANDS_EXPR[i].command(rpc);
				return;
			}
		}
		doUnknown(rpc);
	}
	
	function doSession(rpc) {
		var agent = navigator.userAgent;
		var browserName = "Unknown";
		var browserVersion = "Unknown";
		if (agent.match(/.*msie.*/i)) {
			browserName = "InternetExplorer";
		} else if (agent.match(/.*firefox\/(\d+\.\d+).*/i)) {
			browserName = "FireFox";
			browserVersion = RegExp.$1;
		} else if (agent.match(/.*version\/(\d+\.\d+\.\d+).*safari.*/i)) {
			browserName = "Safari";
			browserVersion = RegExp.$1;
		} else if (agent.match(/.*opera.*/)) {
			browserName = "Opera";
		} else if (agent.match(/.*chrome.*/)) {
			browserName = "Chrome";
		}

		response({
			"sessionId":rpc.sessionId,
			"status":0,
			"value":{
				"platform":navigator.platform,
				"javascriptEnabled":true,
				"acceptSslCerts":false,
				"browserName":browserName,
				"rotatable":false,
				"locationContextEnabled":false,
				"webdriver.remote.sessionid":rpc.sessionId,
				"version":browserVersion,
				"databaseEnabled":("openDatabase" in window ? true : false),
				"cssSelectorsEnabled":("querySelector" in document ? true : false),
				"handlesAlerts":false,
				"browserConnectionEnabled":false,
				"webStorageEnabled":("localStorage" in window ? true : false),
				"nativeEvents":false,
				"applicationCacheEnabled":false,
				"takesScreenshot":false
			},
			"state":null,
			"class":CLASS_NAME
		});
	}
	
	function doUrl(rpc) {
		if (rpc.method == 'GET') {
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":location.href,
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":null,
				"state":"success",
				"class":CLASS_NAME
			}, function() {
				location = rpc.data.url;
			});
		}
	}
	
	function doTitle(rpc) {
		response({
			"sessionId":rpc.sessionId,
			"status":0,
			"value":document.title,
			"state":"success",
			"class":CLASS_NAME
		});
	}

	function doElement(rpc, context) {
		try {
			switch(rpc.data.using) {
			case 'class name':
				doElementByClass(rpc, context);
				break;
			case 'css selector':
				doElementBySelector(rpc, context);
				break;
			case 'id':
				doElementById(rpc, context);
				break;
			case 'name':
				doElementByName(rpc, context);
				break;
			case 'link text':
				doElementByLinkText(rpc, context);
				break;
			case 'partial link text':
				doElementByPartialLinkText(rpc, context);
				break;
			case 'tag name':
				doElementByTagName(rpc, context);
				break;
			case 'xpath':
				doElementByXpath(rpc, context);
				break;
			default:
				doUnknown(rpc);
			}
		} catch (err) {
			doError(rpc, 32, err.toString(), 'InvalidSelector');
		}
	}

	function doBack(rpc) {
		try {
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":null,
				"state":"success",
				"class":CLASS_NAME
			}, function() {
				history.back();
			});
		} catch (error) {
			response({
				"sessionId":rpc.sessionId,
				"status":17,
				"value":error.toString(),
				"state":"JavaScriptError",
				"class":CLASS_NAME
			});
		}
	}

	function doForward(rpc) {
		try {
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":null,
				"state":"success",
				"class":CLASS_NAME
			}, function() {
				history.forward();
			});
		} catch (error) {
			response({
				"sessionId":rpc.sessionId,
				"status":17,
				"value":error.toString(),
				"state":"JavaScriptError",
				"class":CLASS_NAME
			});
		}
	}

	function doRefresh(rpc) {
		try {
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":null,
				"state":"success",
				"class":CLASS_NAME
			}, function() {
				location.reload();
			});
		} catch (error) {
			response({
				"sessionId":rpc.sessionId,
				"status":17,
				"value":error.toString(),
				"state":"JavaScriptError",
				"class":CLASS_NAME
			});
		}
	}

	function doExecute(rpc) {
		try {
			var script = rpc.data.script
				.replace(/^\s*return\s+\(([\s\S]*?})\)\.apply\(.*?\);/, "(function() { return $1; })()")
				.replace(/^\s*return\s+(.*)$/, "(function(){ return function(){return $1;}; })()");
			var args   = [];
			for (var i = 0; i < rpc.data.args.length; i++) {
				if (typeof(rpc.data.args[i]) == 'object')
					args.push(founds[rpc.data.args[i].ELEMENT]);
				else
					args.push(rpc.data.args[i]);
			}
			var result = eval(script);
			if (typeof(result) == 'function') {
				result = result.apply(null, args);
			}
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":result,
				"state":"success",
				"class":CLASS_NAME
			});
		} catch (error) {
			response({
				"sessionId":rpc.sessionId,
				"status":17,
				"value":error.toString(),
				"state":"JavaScriptError",
				"class":CLASS_NAME
			});
		}
	}
	
	function doSource(rpc) {
		response({
			"sessionId":rpc.sessionId,
			"status":0,
			"value":document.documentElement.outerHTML,
			"state":"success",
			"class":CLASS_NAME
		});
	}
	
	function doElementByClass(rpc, context) {
		context = context || document;
		var name = rpc.data.value.trim();
		var xpath = "//*[contains(concat(' ',@class,' '),' " + name + " ')]";
		var elements = context.evaluate(xpath, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if (getCommand(rpc) == 'elements') {
			var results = [];
			for (var i = 0; i < elements.snapshotLength; i++) {
				var e = elements.snapshotItem(i);
				hilit(e);
				results.push({"ELEMENT":newElementId(e)});
			}
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":results,
				"state":"success",
				"class":CLASS_NAME
			});
		} else if (elements.snapshotLength > 0) {
			var e = elements.snapshotItem(0);
			hilit(e);
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":{"ELEMENT":newElementId(e)},
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doElementBySelector(rpc, context) {
		context = context || document;
		var selector = rpc.data.value;
		var elements = context.querySelectorAll(selector);
		if (getCommand(rpc) == 'elements') {
			var results = [];
			for (var i = 0; i < elements.length; i++) {
				var e = elements[i];
				hilit(e);
				results.push({"ELEMENT":newElementId(e)});
			}
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":results,
				"state":"success",
				"class":CLASS_NAME
			});
		} else if (elements.length > 0) {
			var e = elements[0];
			hilit(e);
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":{"ELEMENT":newElementId(e)},
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doElementById(rpc, context) {
		//console.log("doElementById(" + JSON.stringify(rpc) + ")");
		context = context || document;
		var id = rpc.data.value;
		var elements = document.evaluate("//*[@id='" + id + "']", context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if (getCommand(rpc) == "elements") {
			var results = [];
			if (elements.snapshotLength > 0) {
				var e = elements.snapshotItem(0);
				hilit(e);
				results.push({"ELEMENT":newElementId(e)});
			}
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":results,
				"state":"success",
				"class":CLASS_NAME
			});
		} else if (elements.snapshotLength > 0) {
			var e = elements.snapshotItem(0);
			hilit(e);
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":{"ELEMENT":newElementId(e)},
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doElementByName(rpc, context) {
		context = context || document;
		var name = rpc.data.value;
		var elements = document.evaluate("//*[@name='" + name + "']", context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if (getCommand(rpc) == 'elements') {
			var results = [];
			for (var i = 0; i < elements.snapshotLength; i++) {
				var e = elements.snapshotItem(i);
				hilit(e);
				results.push({"ELEMENT":newElementId(e)});
			}
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":results,
				"state":"success",
				"class":CLASS_NAME
			});
		} else if (elements.snapshotLength > 0) {
			var e = elements.snapshotItem(0);
			hilit(e);
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":{"ELEMENT":newElementId(e)},
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doElementByLinkText(rpc, context) {
		context = context || document;
		var text = rpc.data.value;
		var snapshot = document.evaluate("//a[text()='" + text + "']", context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if (getCommand(rpc) == 'elements') {
			var results = [];
			for (var i = 0; i < snapshot.snapshotLength; i++) {
				var e = snapshot.snapshotItem(i);
				hilit(e);
				founds.push(e);
				results.push({"ELEMENT":newElementId(e)});
			} 
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":results,
				"state":"success",
				"class":CLASS_NAME
			});
		} else if (snapshot.snapshotLength > 0) {
			var e = snapshot.snapshotItem(0);
			hilit(e);
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":{"ELEMENT":newElementId(e)},
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}

	function doElementByPartialLinkText(rpc, context) {
		context = context || document;
		var text = rpc.data.value;
		var result = {
			"sessionId":rpc.sessionId,
			"status":7,
			"value":[],
			"state":"NoSuchElement",
			"class":CLASS_NAME
		};
		var snapshot = document.evaluate("//a[contains(text(),'" + text + "')]", context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if (getCommand(rpc) == 'elements') {
			result.status = 0;
			result.state = "success";
			for (var i = 0; i < snapshot.snapshotLength; i++) {
				var e = snapshot.snapshotItem(i);
				var id = new String(founds.length);
				hilit(e);
				founds.push(e);
				result.value.push({"ELEMENT":id});
			}
		} else if (snapshot.snapshotLength > 0) {
			var e = snapshot.snapshotItem(0);
			var id = new String(founds.length);
			hilit(e);
			founds.push(e);
			result.status = 0;
			result.value = {"ELEMENT":id};
			result.state = "success";
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(jsonify(result));
		log("<<" + result);
	}

	function doElementByTagName(rpc, context) {
		context = context || document;
		var tagName = rpc.data.value;
		var elements = document.evaluate("//" + tagName, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); 
		if (getCommand(rpc) == 'elements') {
			var results = [];
			for (var i = 0; i < elements.snapshotLength; i++) {
				var e = elements.snapshotItem(i);
				hilit(e);
				results.push({"ELEMENT":newElementId(e)});
			}
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":results,
				"state":"success",
				"class":CLASS_NAME
			});
		} else if (elements.snapshotLength > 0) {
			var e = elements.snapshotItem(0);
			hilit(e);
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":{"ELEMENT":newElementId(e)},
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}

	function doElementByXpath(rpc, context) {
		context = context || document;
		var xpath = rpc.data.value;
		var snapshot = document.evaluate(xpath, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if (getCommand(rpc) == 'elements') {
			var results = [];
			for (var i = 0; i < snapshot.snapshotLength; i++) {
				var e = snapshot.snapshotItem(i);
				hilit(e);
				results.push({"ELEMENT":newElementId(e)});
			}
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":results,
				"state":"success",
				"class":CLASS_NAME
			});
		} else if (snapshot.snapshotLength > 0) {
			var e = snapshot.snapshotItem(0);
			hilit(e);
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":{"ELEMENT":newElementId(e)},
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}

	function doElementClick(rpc) {
		var element = founds[getElementId(rpc)];
		if (element) {
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":null,
				"state":"success",
				"class":CLASS_NAME
			}, function() {
				if (element.click) {
					element.click();
				} else if (element.fireEvent) {
					element.fireEvent("onclick");
				} else if (document.createEvent) {
					var evt = document.createEvent("MouseEvents");
					evt.initEvent("click", false, true);
					element.dispatchEvent(evt);
				}
			});
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}

	function doElementValue(rpc) {
		var element = founds[getElementId(rpc)];
		if (element) {
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":element.value,
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doElementText(rpc) {
		var element = founds[getElementId(rpc)];
		if (element) {
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":element.textContent,
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
		if (element) element.value = rpc.data.value;
	}
	
	function doElementName(rpc) {
		var element = founds[getElementId(rpc)];
		if (element) {
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":element.nodeName.toLowerCase(),
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doElementCssValue(rpc) {
		var result = {
			"sessionId":rpc.sessionId,
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		};
		var element = founds[rpc.id];
		var styles = window.getComputedStyle(element);
		if (element) {
			result = {
				"sessionId":rpc.sessionId,
				"status":0,
				"value":styles[rpc.propertyName],
				"state":"success",
				"class":CLASS_NAME
			};
		}
		response(result);
	}
	
	function doElementAttribute(rpc) {
		var element = founds[getElementId(rpc)];
		if (element) {
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":element.getAttribute(getAttributeName(rpc)),
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doElementDisplayed(rpc) {
		var element = founds[getElementId(rpc)];
		if (element) {
			var css = window.getComputedStyle(element);
			var display =
				css['visibility'] != "hidden" && css['display'] != "none";
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":display,
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doElementSelected(rpc) {
		var element = founds[getElementId(rpc)];
		if (element) {
			response({
				"sessionId":rpc.sessionId,
				"status":0,
				"value":(element.selected ||element.checked) ? true : false,
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doElementExecute(rpc) {
		var script = rpc.data.script;
		var args   = rpc.data.args;
		var evalResult = eval(script);
		response({
			"sessionId":rpc.sessionId,
			"status":0,
			"value":evalResult,
			"state":"success",
			"class":CLASS_NAME
		});
	}
	
	function doElementElement(rpc) {
		var context = founds[rpc.id];
		if (context) {
			doElement(rpc, context);
		} else {
			response({
				"sessionId":rpc.sessionId,
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doCookie(rpc) {
		var resp = {
			"sessionId":rpc.sessionId,
			"status":9,
			"value":null,
			"state":"failure",
			"class":CLASS_NAME
		};
		var name = rpc.path.replace(/\/session\/[^\/]+\/cookie(\/([^\/]+))?/, "$2");
		switch (rpc.method) {
		case 'GET':
			if (!name) {
				var cookies = document.cookie.split(/\s*;\s*/);
				var result = [];
				for (var i = 0; i < cookies.length; i++) {
					var pair = cookies[i].split(/=/, 2);
					result.push({name:pair[0], value:pair[1]});
				}
				resp.status = 0;
				resp.value = result;
				resp.state = "success";
			}
			break;
			
		case 'POST':
			var cookie = rpc.data.cookie;
			if (cookie && cookie.name) {
				document.cookie = cookie.name + "=" + cookie.value;
				resp.status = 0;
				resp.state = "success";
			}
			break;
			
		case 'DELETE':
			var expires = new Date();
			expires.setTime(0);
			if (name) {
				document.cookie = name + "=;expires=" + expires.toUTCString();
				resp.status = 0;
				resp.state = "success";
			} else {
				var cookies = document.cookie.split(/\s*;\s*/);
				for (var i = 0; i < cookies.length; i++) {
					var pair = cookies[i].split(/=/, 2);
					document.cookie = pair[0] + "=;expires=" + expires.toUTCString();
				}
				resp.status = 0;
				resp.value = result;
				resp.state = "success";
			}
			break;

		default:
		}
		response(resp);
	}
	
	function doNotImplement(rpc) {
		response({
			"sessionId":rpc.sessionId,
			"status":9,
			"value":null,
			"state":"not implemented",
			"class":CLASS_NAME
		});
	}
	
	function doUnknown(rpc) {
		response({
			"sessionId":rpc.sessionId,
			"status":9,
			"value":null,
			"state":"unknown",
			"class":CLASS_NAME
		});
	}

	/**
	 * @function
	 */
	function doError(rpc, status, value, state) {
		response({
			"sessionId":rpc.sessionId,
			"status":status,
			"value":value,
			"state":state,
			"class":CLASS_NAME
		});
	}
	
	connect();
};

	if (document.readyState == "complete")
		init();
	else
		window.addEventListener("load", init);
})();

