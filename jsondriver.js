window.addEventListener("load", function() {
	var CLASS_NAME = "json.driver.Target";
	var BASE_URL = '%BASE_URL%';
	var founds = [];
	
	function connect() {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) { // DONE
				if (xhr.status == 200) { // OK
					var rpc = JSON.parse(xhr.responseText);
					log(">>" + xhr.responseText);
try {
					if (rpc.path.match(/^\/session\/[^\/]+$/)) {
						doSession(rpc);
					} else if (rpc.path.match(/^\/session\/[^\/]+\/url$/)) {
						doUrl(rpc);
					} else if (rpc.path.match(/^\/session\/[^\/]+\/title$/)) {
						doTitle(rpc);
					} else if (rpc.path.match(/^\/session\/[^\/]+\/element$/)) {
						doElement(rpc);
					} else if (rpc.path.match(/^\/session\/[^\/]+\/element\/[^\/]+\/click$/)) {
						doElementClick(rpc);
					} else if (rpc.path.match(/^\/session\/[^\/]+\/element\/[^\/]+\/value$/)) {
						doElementValue(rpc);
					} else if (rpc.path.match(/^\/session\/[^\/]+\/element\/[^\/]+\/text$/)) {
						doElementText(rpc);
					} else {
						doUnknown(rpc);
					}
} catch(e) {
	log(e);
}
				} else {
					log("[E]" + xhr.status);
				}
				connect();
			}
		}
		xhr.open("GET", BASE_URL + "/wd/hub/target");
		xhr.send();
	}
	
	function log(text) {
		var line = document.body.appendChild(document.createElement("div"));
		line.appendChild(document.createTextNode(text));
	}
	
	function getSessionId(rpc) {
		return rpc.path.replace(/^\/session\/([^\/]+).*$/, "$1");
	}
	
	function getElementId(rpc) {
		var result = rpc.path.replace(/^\/session\/([^\/]+)\/element\/([^\/]+).*$/, "$2");
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
					log("[E]" + xhr.status);
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
	
	function doElement(rpc) {
		switch(rpc.data.using) {
		case 'class name':
			doElementByClass(rpc);
			break;
		case 'css selector':
			doElementBySelector(rpc);
			break;
		case 'id':
			doElementById(rpc);
			break;
		case 'name':
			doElementByName(rpc);
			break;
		case 'link text':
			doElementByLinkText(rpc);
			break;
		case 'partial link text':
			doElementByPartialLinkText(rpc);
			break;
		case 'tag name':
			doElementByTagName(rpc);
			break;
		case 'xpath':
			doElementByXpath(rpc);
			break;
		default:
			doUnknown(rpc);
		}
	}
	
	function doElementByClass(rpc) {
		var name = rpc.data.value;
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		});
		var elements = document.getElementsByClassName(name);
		if (elements.length > 0) {
			var e = elements[0];
			var id = new String(founds.length);
			founds.push(e);
			result = JSON.stringify({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":{"ELEMENT":id},
				"state":"success",
				"class":CLASS_NAME
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
	}
	
	function doElementBySelector(rpc) {
		var selector = rpc.data.value;
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		});
		var element = document.querySelector(selector);
		if (element) {
			var id = new String(founds.length);
			founds.push(element);
			result = JSON.stringify({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":{"ELEMENT":id},
				"state":"success",
				"class":CLASS_NAME
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
	}
	
	function doElementById(rpc) {
		var id = rpc.data.value;
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		});
		var element = document.getElementById(id);
		if (element) {
			var id = new String(founds.length);
			founds.push(element);
			result = JSON.stringify({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":{"ELEMENT":id},
				"state":"success",
				"class":CLASS_NAME
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
	}
	
	function doElementByName(rpc) {
		var name = rpc.data.value;
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		});
		var elements = document.getElementsByName(name);
		if (elements.length > 0) {
			var element = elements[0];
			var id = new String(founds.length);
			founds.push(element);
			result = JSON.stringify({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":{"ELEMENT":id},
				"state":"success",
				"class":CLASS_NAME
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
	}
	
	function doElementByLinkText(rpc) {
		var text = rpc.data.value;
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		});
		var element = document.evaluate("//a[text()='" + text + "']", document, null, XPathResult.ANY_TYPE, null).iterateNext(); 
		if (element) {
			var id = new String(founds.length);
			founds.push(element);
			result = JSON.stringify({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":{"ELEMENT":id},
				"state":"success",
				"class":CLASS_NAME
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
	}

	function doElementByPartialLinkText(rpc) {
		var text = rpc.data.value;
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		});
		var element = document.evaluate("//a[contains(text(),'" + text + "')]", document, null, XPathResult.ANY_TYPE, null).iterateNext(); 
		if (element) {
			var id = new String(founds.length);
			founds.push(element);
			result = JSON.stringify({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":{"ELEMENT":id},
				"state":"success",
				"class":CLASS_NAME
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
	}

	function doElementByTagName(rpc) {
		var tagName = rpc.data.value;
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		});
		var elements = document.getElementsByTagName(tagName);
		if (elements.length > 0) {
			var element = elements[0];
			var id = new String(founds.length);
			founds.push(element);
			result = JSON.stringify({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":{"ELEMENT":id},
				"state":"success",
				"class":CLASS_NAME
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
	}

	function doElementByXpath(rpc) {
		var xpath = rpc.data.value;
		var result = JSON.stringify({
			"sessionId":getSessionId(rpc),
			"status":7,
			"value":null,
			"state":"NoSuchElement",
			"class":CLASS_NAME
		});
		var element = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null).iterateNext(); 
		if (element) {
			var id = new String(founds.length);
			founds.push(element);
			result = JSON.stringify({
				"sessionId":getSessionId(rpc),
				"status":0,
				"value":{"ELEMENT":id},
				"state":"success",
				"class":CLASS_NAME
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/wd/hub/target");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(result);
		log("<<" + result);
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
