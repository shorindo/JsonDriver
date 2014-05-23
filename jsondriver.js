window.addEventListener("load", function() {
	var CLASS_NAME = "json.driver.Target";
	var BASE_URL = '%BASE_URL%';
	var founds = [];
	
	function connect() {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) { // DONE
				if (xhr.status == 200) { // OK
					log(">>" + xhr.responseText);
					try {
						var rpc = JSON.parse(xhr.responseText);
						if (rpc.path.match(/^\/session\/[^\/]+$/)) {
							doSession(rpc);
						} else if (rpc.path.match(/^\/session\/[^\/]+\/url$/)) {
							doUrl(rpc);
						} else if (rpc.path.match(/^\/session\/[^\/]+\/title$/)) {
							doTitle(rpc);
						} else if (rpc.path.match(/^\/session\/[^\/]+\/element$/)) {
							doElement(rpc, false);
						} else if (rpc.path.match(/^\/session\/[^\/]+\/elements$/)) {
							doElement(rpc, true);
						} else if (rpc.path.match(/^\/session\/[^\/]+\/element\/[^\/]+\/click$/)) {
							doElementClick(rpc);
						} else if (rpc.path.match(/^\/session\/[^\/]+\/element\/[^\/]+\/value$/)) {
							doElementValue(rpc);
						} else if (rpc.path.match(/^\/session\/[^\/]+\/element\/[^\/]+\/text$/)) {
							doElementText(rpc);
						} else if (rpc.path.match(/^\/session\/[^\/]+\/element\/[^\/]+\/name$/)) {
							doElementName(rpc);
						} else if (rpc.path.match(/^\/session\/[^\/]+\/element\/[^\/]+\/css\/[^\/]+$/)) {
							doElementCssValue(rpc);
						} else if (rpc.path.match(/^\/session\/[^\/]+\/element\/[^\/]+\/attribute\/[^\/]+$/)) {
							doElementAttribute(rpc);
						} else if (rpc.path.match(/^\/session\/[^\/]+\/element\/\d+\/element$/)) {
							doElementElement(rpc);
						} else if (rpc.path.match(/^\/session\/[^\/]+\/execute$/)) {
							doExecute(rpc);
						} else if (rpc.path.match(/^\/session\/[^\/]+\/source$/)) {
							doSource(rpc);
						} else {
							doUnknown(rpc);
						}
						connect();
					} catch(e) {
						log("[E]" + e);
						setTimeout(connect, 5000);
					}
				} else {
					log("[E]" + xhr.statusText);
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
	
	function getSessionId(rpc) {
		return rpc.path.replace(/^\/session\/([^\/]+).*$/, "$1");
	}
	
	function getElementId(rpc) {
		//console.log("getElementId(" + rpc.path + ")");
		var result = rpc.path.replace(/^\/session\/([^\/]+)\/element\/(\d+)(\/.*)$/, "$2");
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
	
	function doSession(rpc) {
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":0,
			"value":{
				"platform":"XP",
				"javascriptEnabled":true,
				"acceptSslCerts":true,
				"browserName":"firefox",
				"rotatable":false,
				"locationContextEnabled":true,
				"webdriver.remote.sessionid":getSessionId(rpc),
				"version":"27.0.1",
				"databaseEnabled":true,
				"cssSelectorsEnabled":true,
				"handlesAlerts":true,
				"browserConnectionEnabled":true,
				"webStorageEnabled":true,
				"nativeEvents":false,
				"applicationCacheEnabled":true,
				"takesScreenshot":false
			},
			"state":null,
			"class":CLASS_NAME
		});
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) { // DONE
				if (xhr.status == 200) { // OK
					log(xhr.responseText);
				} else {
					log("[E]" + xhr.statusText);
				}
			}
		}
		try {
			xhr.open("POST", BASE_URL + "/wd/hub/target");
			xhr.setRequestHeader('Content-Type', 'application/json');
			xhr.send(result);
			log("<<" + result);
		} catch (e) {
			log(e);
		}
	}
	
	function doUrl(rpc) {
		location = rpc.data.url;
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":0,
			"value":null,
			"state":"success",
			"class":CLASS_NAME
		});
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
	}
	
	function doTitle(rpc) {
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":0,
			"value":document.title,
			"state":"success",
			"class":CLASS_NAME
		});
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
	}
	
	function doElement(rpc, multiple) {
		switch(rpc.data.using) {
		case 'class name':
			doElementByClass(rpc, multiple);
			break;
		case 'css selector':
			doElementBySelector(rpc, multiple);
			break;
		case 'id':
			doElementById(rpc, multiple);
			break;
		case 'name':
			doElementByName(rpc, multiple);
			break;
		case 'link text':
			doElementByLinkText(rpc, multiple);
			break;
		case 'partial link text':
			doElementByPartialLinkText(rpc, multiple);
			break;
		case 'tag name':
			doElementByTagName(rpc, multiple);
			break;
		case 'xpath':
			doElementByXpath(rpc, multiple);
			break;
		default:
			doUnknown(rpc);
		}
	}

	function doExecute(rpc) {
		var script = rpc.data.script;
		var args   = rpc.data.args;
		var evalResult = eval(script);
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":0,
			"value":evalResult,
			"state":"success",
			"class":CLASS_NAME
		});
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
	}
	
	function doSource(rpc) {
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":0,
			"value":document.documentElement.outerHTML,
			"state":"success",
			"class":CLASS_NAME
		});
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
	}
	
	function doElementByClass(rpc, multiple) {
		var name = rpc.data.value;
		var result = {
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":[],
			"state":"NoSuchElement",
			"class":CLASS_NAME
		};
		var elements = document.getElementsByClassName(name);
		if (multiple) {
			result.status = 0;
			result.state = "success";
			for (var i = 0; i < elements.length; i++) {
				var e = elements[i];
				var id = new String(founds.length);
				hilit(e);
				founds.push(e);
				result.value.push({"ELEMENT":id});
			}
		} else if (elements.length > 0) {
			var e = elements[0];
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
		log("<<" + JSON.stringify(result));
	}
	
	function doElementBySelector(rpc, multiple) {
		var selector = rpc.data.value;
		var result = {
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":[],
			"state":"NoSuchElement",
			"class":CLASS_NAME
		};
		var elements = document.querySelectorAll(selector);
		if (multiple) {
			result.status = 0;
			result.state = "success";
			for (var i = 0; i < elements.length; i++) {
				var e = elements[i];
				var id = new String(founds.length);
				hilit(e);
				founds.push(e);
				result.value.push({"ELEMENT":id});
			}
		} else if (elements.length > 0) {
			var e = elements[0];
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
	
	function doElementById(rpc, multiple) {
		console.log("doElementById(" + JSON.stringify(rpc) + ")");
		var id = rpc.data.value;
		var result = {
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":[],
			"state":"NoSuchElement",
			"class":CLASS_NAME
		};
		var element = document.getElementById(id);
		if (multiple) {
			result.status = 0;
			result.state = "success";
			if (element) {
				var id = new String(founds.length);
				hilit(element);
				founds.push(element);
				result.value.push({"ELEMENT":element});
			}
		} else if (element) {
			var id = new String(founds.length);
			hilit(element);
			founds.push(element);
			result.status = 0;
			result.value = {"ELEMENT":id};
			result.state = "success";
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify(result));
		log("<<" + JSON.stringify(result));
	}
	
	function doElementByName(rpc, multiple) {
		var name = rpc.data.value;
		var result = {
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":[],
			"state":"NoSuchElement",
			"class":CLASS_NAME
		};
		var elements = document.getElementsByName(name);
		if (multiple) {
			result.status = 0;
			result.state = "success";
			for (var i = 0; i < elements.length; i++) {
				var e = elements[i];
				var id = new String(founds.length);
				hilit(e);
				founds.push(e);
				result.value.push({"ELEMENT":id});
			}
		} else if (elements.length > 0) {
			var element = elements[0];
			var id = new String(founds.length);
			hilit(element);
			founds.push(element);
			result.status = 0;
			result.value = {"ELEMENT":id};
			result.state = "success";
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify(result));
		log("<<" + JSON.stringify(result));
	}
	
	function doElementByLinkText(rpc, multiple) {
		var text = rpc.data.value;
		var result = {
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":[],
			"state":"NoSuchElement",
			"class":CLASS_NAME
		};
		var snapshot = document.evaluate("//a[text()='" + text + "']", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if (multiple) {
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
		log("<<" + JSON.stringify(result));
	}

	function doElementByPartialLinkText(rpc, multiple) {
		var text = rpc.data.value;
		var result = {
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":[],
			"state":"NoSuchElement",
			"class":CLASS_NAME
		};
		var snapshot = document.evaluate("//a[contains(text(),'" + text + "')]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if (multiple) {
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

	function doElementByTagName(rpc, multiple) {
		var tagName = rpc.data.value;
		var result = {
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":[],
			"state":"NoSuchElement",
			"class":CLASS_NAME
		};
		var elements = document.getElementsByTagName(tagName);
		if (multiple) {
			result.status = 0;
			result.state = "success";
			for (var i = 0; i < elements.length; i++) {
				var e = elements[i];
				var id = new String(founds.length);
				hilit(e);
				founds.push(e);
				result.value.push({"ELEMENT":id});
			}
		} else if (elements.length > 0) {
			var e = elements[0];
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

	function doElementByXpath(rpc, multiple) {
		var xpath = rpc.data.value;
		var result = {
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":[],
			"state":"NoSuchElement",
			"class":CLASS_NAME
		};
		var snapshot = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if (multiple) {
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
		log("<<" + JSON.stringify(result));
	}

	function doElementClick(rpc) {
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		});
		var element = founds[getElementId(rpc)];
		if (element) {
			result = JSON.stringify({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":null,
				"state":"success",
				"class":CLASS_NAME
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target", false);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
		if (element) element.click();
	}

	function doElementValue(rpc) {
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		});
		var element = founds[getElementId(rpc)];
		if (element) {
			result = JSON.stringify({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":null,
				"state":"success",
				"class":CLASS_NAME
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target", false);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
		if (element) element.value = rpc.data.value;
	}
	
	function doElementText(rpc) {
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		});
		var element = founds[getElementId(rpc)];
		if (element) {
			result = JSON.stringify({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":element.textContent,
				"state":"success",
				"class":CLASS_NAME
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target", false);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
		if (element) element.value = rpc.data.value;
	}
	
	function doElementName(rpc) {
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		});
		var element = founds[getElementId(rpc)];
		if (element) {
			result = JSON.stringify({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":element.nodeName.toLowerCase(),
				"state":"success",
				"class":CLASS_NAME
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target", false);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
		if (element) element.value = rpc.data.value;
	}
	
	function doElementCssValue(rpc) {
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		});
		var element = founds[getElementId(rpc)];
		if (element) {
			result = JSON.stringify({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":element.style[getCssName(rpc)],
				"state":"success",
				"class":CLASS_NAME
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target", false);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
		if (element) element.value = rpc.data.value;
	}
	
	function doElementAttribute(rpc) {
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		});
		var element = founds[getElementId(rpc)];
		if (element) {
			result = JSON.stringify({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":element.getAttribute(getAttributeName(rpc)),
				"state":"success",
				"class":CLASS_NAME
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target", false);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
		if (element) element.value = rpc.data.value;
	}
	
	function doElementExecute(rpc) {
		var script = rpc.data.script;
		var args   = rpc.data.args;
		var evalResult = eval(script);
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":0,
			"value":evalResult,
			"state":"success",
			"class":CLASS_NAME
		});
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
	}
	
	function doElementElement(rpc) {
		console.log("doElementElement()");
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		});
		var element = founds[getElementId(rpc)];
		if (element) {
			result = JSON.stringify({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":"12345",
				"state":"success",
				"class":CLASS_NAME
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target", false);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
	}
	
	function doUnknown(rpc) {
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":9,
			"value":null,
			"state":"unknown",
			"class":CLASS_NAME
		});
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
	}
	
	connect();
});
