window.addEventListener("load", function() {
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
		'/session/:sessionId/element/:id/submit'			: doElementClick,
		'/session/:sessionId/element/:id/text'				: doElementText,
		'/session/:sessionId/element/:id/name'				: doElementName,
		'/session/:sessionId/element/:id/selected'			: doNotImplement,
		'/session/:sessionId/element/:id/enabled'			: doNotImplement,
		'/session/:sessionId/element/:id/displayed'			: doNotImplement,
		'/session/:sessionId/element/:id/location'			: doNotImplement,
		'/session/:sessionId/element/:id/size'				: doNotImplement,
		'/session/:sessionId/element/:id/attribute/:name'	: doElementAttribute,
		'/session/:sessionId/element/:id/css/:propertyName'	: doElementCssValue,
		'/session/:sessionId/element/:id/equals/:other'		: doNotImplement,
		'/session/:sessionId/window'						: doNotImplement,
		'/session/:sessionId/window/:windowHandle/maximize'	: doNotImplement,
		'/session/:sessionId/window/:windowHandle/position'	: doNotImplement,
		'/session/:sessionId/window/:windowHandle/size'		: doNotImplement,
		'/session/:sessionId/frame'							: doNotImplement,
		'/session/:sessionId/source'						: doSource,
		'/session/:sessionId/title'							: doTitle,
		'/session/:sessionId/execute'						: doExecute,
		'/session/:sessionId/execute_async'					: doNotImplement,
		'/session/:sessionId/screenshot'					: doNotImplement,
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
		'/session/:sessionId/log/types'						: doNotImplement,
		'/logs'												: doNotImplement
	};
	var COMMANDS_EXPR = [];
	for (var key in COMMANDS) {
		COMMANDS_EXPR.push({
			regexp : new RegExp("^" + key.replace(/:[^\/]+/g, "[^\\/]+") + "$"),
			command : COMMANDS[key]
		});
	}

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
						log("[E]" + e.toString());
						doError(rpc, 9, e.toString(), 'UnknownError');
						setTimeout(connect, 5000);
					}
				} else {
					log("[E]" + JSON.stringify(xhr));
					//doError(rpc, 9, xhr.statusText, 'UnknownError');
					setTimeout(connect, 5000);
				}
			}
		}
		xhr.open("GET", BASE_URL + "/wd/hub/target");
		xhr.send();
	}
	
	function log(text) {
		var line = document.body.appendChild(document.createElement("div"));
		line.appendChild(document.createTextNode(text));
		console.log(text);
	}
	
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
		with (cover.style) {
			position = "absolute";
			top = geo.top + "px";
			left = geo.left + "px";
			width = geo.width + "px";
			height = geo.height + "px";
			background = "yellow";
			opacity = 0.5;
			zIndex = 99999999;
		}
		setTimeout(function() {
			cover.parentNode.removeChild(cover);
		}, 1000);
	}
	
	function response(obj, callback) {
		var result = JSON.stringify(obj);
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
	function getSessionId(rpc) {
		return rpc.path.replace(/^\/session\/([^\/]+).*$/, "$1");
	}
	
	function getCommand(rpc) {
		return rpc.path.replace(/^.*?([^\/]+)$/, "$1");
	}
	
	function getElementId(rpc) {
		//console.log("getElementId(" + rpc.path + ")");
		var result = rpc.path.replace(/^\/session\/([^\/]+)\/element\/(\d+)(\/.*)?$/, "$2");
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
		for (var key in COMMANDS_EXPR) {
			if (COMMANDS_EXPR[key].regexp.test(rpc.path)) {
				COMMANDS_EXPR[key].command(rpc);
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
			browserVersion = RegExp.$1
		} else if (agent.match(/.*opera.*/)) {
			browserName = "Opera";
		} else if (agent.match(/.*chrome.*/)) {
			browserName = "Chrome";
		}

		response({
			"sessionId":getSessionId(rpc),
			"status":0,
			"value":{
				"platform":navigator.platform,
				"javascriptEnabled":true,
				"acceptSslCerts":false,
				"browserName":browserName,
				"rotatable":false,
				"locationContextEnabled":false,
				"webdriver.remote.sessionid":getSessionId(rpc),
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
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":location.href,
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":getSessionId(rpc),
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
			"sessionId":getSessionId(rpc),
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
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":null,
				"state":"success",
				"class":CLASS_NAME
			}, function() {
				history.back();
			});
		} catch (error) {
			response({
				"sessionId":getSessionId(rpc),
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
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":null,
				"state":"success",
				"class":CLASS_NAME
			}, function() {
				history.forward();
			});
		} catch (error) {
			response({
				"sessionId":getSessionId(rpc),
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
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":null,
				"state":"success",
				"class":CLASS_NAME
			}, function() {
				location.reload();
			});
		} catch (error) {
			response({
				"sessionId":getSessionId(rpc),
				"status":17,
				"value":error.toString(),
				"state":"JavaScriptError",
				"class":CLASS_NAME
			});
		}
	}

	function doExecute(rpc) {
		var script = rpc.data.script;
		var args   = rpc.data.args;
		try {
			response({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":eval(script),
				"state":"success",
				"class":CLASS_NAME
			});
		} catch (error) {
			response({
				"sessionId":getSessionId(rpc),
				"status":17,
				"value":error.toString(),
				"state":"JavaScriptError",
				"class":CLASS_NAME
			});
		}
	}
	
	function doSource(rpc) {
		response({
			"sessionId":getSessionId(rpc),
			"status":0,
			"value":document.documentElement.outerHTML,
			"state":"success",
			"class":CLASS_NAME
		});
	}
	
	function doElementByClass(rpc, context) {
		context = context ? context : document;
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
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":results,
				"state":"success",
				"class":CLASS_NAME
			});
		} else if (elements.snapshotLength > 0) {
			var e = elements.snapshotItem(0);
			hilit(e);
			response({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":{"ELEMENT":newElementId(e)},
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":getSessionId(rpc),
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doElementBySelector(rpc, context) {
		var selector = rpc.data.value;
		var elements = document.querySelectorAll(selector);
		if (getCommand(rpc) == 'elements') {
			var results = [];
			for (var i = 0; i < elements.length; i++) {
				var e = elements[i];
				hilit(e);
				results.push({"ELEMENT":newElementId(e)});
			}
			response({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":results,
				"state":"success",
				"class":CLASS_NAME
			});
		} else if (elements.length > 0) {
			var e = elements[0];
			hilit(e);
			response({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":{"ELEMENT":newElementId(e)},
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":getSessionId(rpc),
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doElementById(rpc, context) {
		//console.log("doElementById(" + JSON.stringify(rpc) + ")");
		context = context ? context : document;
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
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":results,
				"state":"success",
				"class":CLASS_NAME
			});
		} else if (elements.snapshotLength > 0) {
			var e = elements.snapshotItem(0);
			hilit(e);
			response({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":{"ELEMENT":newElementId(e)},
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":getSessionId(rpc),
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doElementByName(rpc, context) {
		context = context ? context : document
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
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":results,
				"state":"success",
				"class":CLASS_NAME
			});
		} else if (elements.snapshotLength > 0) {
			var e = elements.snapshotItem(0);
			hilit(e);
			response({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":{"ELEMENT":newElementId(e)},
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":getSessionId(rpc),
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doElementByLinkText(rpc, context) {
		var text = rpc.data.value;
		var snapshot = document.evaluate("//a[text()='" + text + "']", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if (getCommand(rpc) == 'elements') {
			var results = [];
			for (var i = 0; i < snapshot.snapshotLength; i++) {
				var e = snapshot.snapshotItem(i);
				hilit(e);
				founds.push(e);
				results.push({"ELEMENT":newElementId(e)});
			} 
			response({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":results,
				"state":"success",
				"class":CLASS_NAME
			});
		} else if (snapshot.snapshotLength > 0) {
			var e = snapshot.snapshotItem(0);
			hilit(e);
			response({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":{"ELEMENT":newElementId(e)},
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":getSessionId(rpc),
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}

	function doElementByPartialLinkText(rpc, context) {
		context = context ? context : document;
		var text = rpc.data.value;
		var result = {
			"sessionId":getSessionId(rpc),
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
		xhr.send(JSON.stringify(result));
		log("<<" + result);
	}

	function doElementByTagName(rpc, context) {
		context = context ? context : document;
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
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":results,
				"state":"success",
				"class":CLASS_NAME
			});
		} else if (elements.snapshotLength > 0) {
			var e = elements.snapshotItem(0);
			hilit(e);
			response({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":{"ELEMENT":newElementId(e)},
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":getSessionId(rpc),
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}

	function doElementByXpath(rpc, context) {
		var xpath = rpc.data.value;
		var snapshot = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if (getCommand(rpc) == 'elements') {
			var results = [];
			for (var i = 0; i < snapshot.snapshotLength; i++) {
				var e = snapshot.snapshotItem(i);
				hilit(e);
				results.push({"ELEMENT":newElementId(e)});
			}
			response({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":results,
				"state":"success",
				"class":CLASS_NAME
			});
		} else if (snapshot.snapshotLength > 0) {
			var e = snapshot.snapshotItem(0);
			hilit(e);
			response({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":{"ELEMENT":newElementId(e)},
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":getSessionId(rpc),
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
				"sessionId":getSessionId(rpc),
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
				"sessionId":getSessionId(rpc),
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
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":element.value,
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":getSessionId(rpc),
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
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":element.textContent,
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":getSessionId(rpc),
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
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":element.nodeName.toLowerCase(),
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":getSessionId(rpc),
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doElementCssValue(rpc) {
		var result = {
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		};
		var element = founds[getElementId(rpc)];
		if (element) {
			result = {
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":element.style[getCssName(rpc)],
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
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":element.getAttribute(getAttributeName(rpc)),
				"state":"success",
				"class":CLASS_NAME
			});
		} else {
			response({
				"sessionId":getSessionId(rpc),
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
			"sessionId":getSessionId(rpc),
			"status":0,
			"value":evalResult,
			"state":"success",
			"class":CLASS_NAME
		});
	}
	
	function doElementElement(rpc) {
		//console.log("doElementElement()");
		var parent = founds[getElementId(rpc)];
		if (parent) {
			doElement(rpc, parent);
		} else {
			response({
				"sessionId":getSessionId(rpc),
				"status":7,
				"value":null,
				"state":"NoSuchElement",
				"class":CLASS_NAME
			});
		}
	}
	
	function doCookie(rpc) {
		var resp = {
			"sessionId":getSessionId(rpc),
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
			"sessionId":getSessionId(rpc),
			"status":9,
			"value":null,
			"state":"not implemented",
			"class":CLASS_NAME
		});
	}
	
	function doUnknown(rpc) {
		response({
			"sessionId":getSessionId(rpc),
			"status":9,
			"value":null,
			"state":"unknown",
			"class":CLASS_NAME
		});
	}

	function doError(rpc, status, value, state) {
		response({
			"sessionId":getSessionId(rpc),
			"status":status,
			"value":value,
			"state":state,
			"class":CLASS_NAME
		});
	}
	
	connect();
});
