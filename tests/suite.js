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

var driver;
QUnit.config.reorder = false;
QUnit.begin = function() {
	driver = new webdriver
		.Builder()
		.usingServer('http://localhost:4444/wd/hub')
		.usingSession("0")
		.build();
};

function title() {
	document.title = QUnit.config.current.testNumber + "." + QUnit.config.current.testName;
}

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

asyncTest('CLICK [START] TO START', function() {
	ok(true);
});

/*
asyncTest('path parser', function() {
	var paths = [
	'/status',
	'/session',
	'/sessions',
	'/session/:sessionId',
	'/session/:sessionId/window',
	'/session/:sessionId/window_handle',
	'/session/:sessionId/window_handles',
	'/session/:sessionId/url',
	'/session/:sessionId/back',
	'/session/:sessionId/forward',
	'/session/:sessionId/refresh',
	'/session/:sessionId/cookie',
	'/session/:sessionId/cookie/:name',
	'/session/:sessionId/element',
	'/session/:sessionId/elements',
	'/session/:sessionId/element/active',
	'/session/:sessionId/element/:id/element',
	'/session/:sessionId/element/:id/elements',
	'/session/:sessionId/element/:id/clear',
	'/session/:sessionId/element/:id/click',
	'/session/:sessionId/element/:id/value',
	'/session/:sessionId/element/:id/submit',
	'/session/:sessionId/element/:id/text',
	'/session/:sessionId/element/:id/name',
	'/session/:sessionId/element/:id/selected',
	'/session/:sessionId/element/:id/enabled',
	'/session/:sessionId/element/:id/displayed',
	'/session/:sessionId/element/:id/location',
	'/session/:sessionId/element/:id/size',
	'/session/:sessionId/element/:id/attribute/:name',
	'/session/:sessionId/element/:id/css/:propertyName',
	'/session/:sessionId/element/:id/equals/:other',
	'/session/:sessionId/window',
	'/session/:sessionId/window/:windowHandle/maximize',
	'/session/:sessionId/window/:windowHandle/position',
	'/session/:sessionId/window/:windowHandle/size',
	'/session/:sessionId/frame',
	'/session/:sessionId/source',
	'/session/:sessionId/title',
	'/session/:sessionId/execute',
	'/session/:sessionId/execute_async',
	'/session/:sessionId/screenshot',
	'/session/:sessionId/timeouts',
	'/session/:sessionId/timeouts/async_script',
	'/session/:sessionId/timeouts/implicit_wait',
	'/session/:sessionId/click',
	'/session/:sessionId/doubleclick',
	'/session/:sessionId/buttondown',
	'/session/:sessionId/buttonup',
	'/session/:sessionId/moveto',
	'/session/:sessionId/keys',
	'/session/:sessionId/accept_alert',
	'/session/:sessionId/dismiss_alert',
	'/session/:sessionId/alert_text',
	'/session/:sessionId/orientation',
	'/session/:sessionId/log',
	'/session/:sessionId/log/types'
	];
	function doCommand(method, pathList, data) {
		var path = pathList.shift();
		switch(path) {
		case "status":
			return doStatus(method, pathList, data);
		case "session":
			return doSession(method, pathList, data);
		case "sessions":
			return doSessions(method, pathList, data);
		default:
			return false;
		}
	}
	function doStatus(method, pathList, data) {
		console.log("doStatus()");
	}
	function doSession(method, pathList, data) {
		var sessionId = pathList.shift;
		console.log("doSession(" + sessionId + ")");
	}
	function doSessions(method, path, data) {
		console.log("doSessions()");
	}
	function doUnknown(method, path, data) {
		console.log("doUnknown()");
	}
	for (var i = 0; i < paths.length; i++) {
		var pathList = paths[i].split(/\//);
		pathList.shift();
		if (!doCommand("GET", pathList, null)) {
			doUnknown("GET", paths[i], null);
		}
	}
	start();
});
*/

/**
 * actions, call, close, controlFlow, executeAsyncScript, executeScript,
 * findElement, findElements, get, getAllWindowHandles, getCapabilities,
 * getCurrentUrl, getPageSource, getSession, getTitle, getWindowHandle,
 * isElementPresent, manage, navigate, quit, schedule, sleep, switchTo,
 * takeScreenshot, wait
 */
module('WebDriver');
asyncTest('getCurrentUrl', function() {
	driver.getCurrentUrl()
		.then(function(url) {
			path = url.replace(/^https?:\/\/[^\/]+(\/.*)$/, "$1");
			equal(path, "/tests/input.html", "URL:" + url);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest('get', function(){
	title();
	//page exist
	driver.get('/tests/input.html');
	driver.findElement(By.className('title'))
		.then(function(e) {
			//console.log(e);
			ok(true, "title");
		});
	driver.wait(function() {
		return driver.getTitle().then(function(title) {
			var expected = 'input';
			var result = title === expected;
			if (result) {
				equal(expected, title, expected);
			}
			return result;
		});
	}, 1000)
	.thenCatch(function() {
		ok(false, "not found");
	})
	.thenFinally(function() {
		start();
	});
});

asyncTest("findElementByClass", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.className('title'))
		.then(function(a) {
			ok(true, "found");
		});
	driver.findElement(By.className('titlex'))
		.then(function() {
			ok(false, "found");
		})
		.thenCatch(function() {
			ok(true, "not found");
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("findElementsByClass", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElements(By.className('title'))
		.then(function(elements) {
			equal(elements.length, 1, 'title found');
		});
	driver.findElements(By.className('titlex'))
		.then(function(elements) {
			equal(elements.length, 0, 'titlex not found')
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("findElementByCssSelector", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.css('.title'))
		.then(function(a) {
			ok(true, "found");
		});
	driver.findElement(By.css('.titlex'))
		.then(function() {
			ok(false, "found");
		})
		.thenCatch(function() {
			ok(true, "not found");
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("findElementsByCssSelector", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElements(By.css('.title'))
		.then(function(elements) {
			equal(elements.length, 1, "found");
		});
	driver.findElements(By.css('.titlex'))
		.then(function(elements) {
			equal(elements.length, 0, "found");
		})
		.thenCatch(function(e) {
			ok(false, "error:" + e);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("findElementById", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.id('navi'))
		.then(function(a) {
			ok(true, "found");
		});
	driver.findElement(By.id('navix'))
		.then(function() {
			ok(false, "found");
		})
		.thenCatch(function() {
			ok(true, "not found");
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("findElementsById", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElements(By.id('navi'))
		.then(function(elements) {
			equal(elements.length, 1, "found");
		});
	driver.findElements(By.id('navix'))
		.then(function(elements) {
			equal(elements.length, 0, "found");
		})
		.thenCatch(function(e) {
			ok(false, "error:" + e);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("findElementByName", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.name('address'))
		.then(function(a) {
			ok(true, "found");
		});
	driver.findElement(By.name('addressx'))
		.then(function() {
			ok(false, "found");
		})
		.thenCatch(function() {
			ok(true, "not found");
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("findElementsByName", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElements(By.name('address'))
		.then(function(elements) {
			equal(elements.length, 1, "found");
		});
	driver.findElements(By.name('addressx'))
		.then(function(elements) {
			equal(elements.length, 0, "not found");
		})
		.thenCatch(function(e) {
			ok(false, "error:" + e);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("findElementByLinkText", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.linkText('list'))
		.then(function(a) {
			ok(true, "found");
		});
	driver.findElement(By.linkText('listx'))
		.then(function() {
			ok(false, "found");
		})
		.thenCatch(function() {
			ok(true, "not found");
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("findElementsByLinkText", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElements(By.linkText('list'))
		.then(function(elements) {
			equal(elements.length, 1, "found");
		});
	driver.findElements(By.linkText('listx'))
		.then(function(elements) {
			equal(elements.length, 0, "not found");
		})
		.thenCatch(function(e) {
			ok(false, "error:" + e);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("findElementByPartialLinkText", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.partialLinkText('lis'))
		.then(function(a) {
			ok(true, "found");
		});
	driver.findElement(By.partialLinkText('listx'))
		.then(function() {
			ok(false, "found");
		})
		.thenCatch(function() {
			ok(true, "not found");
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("findElementsByPartialLinkText", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElements(By.partialLinkText('lis'))
		.then(function(elements) {
			equal(elements.length, 1, "found");
		});
	driver.findElements(By.partialLinkText('listx'))
		.then(function(elements) {
			equal(elements.length, 0, "found");
		})
		.thenCatch(function(e) {
			ok(false, "error:" + e);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("findElementByTagName", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.tagName('select'))
		.then(function(a) {
			ok(true, "found");
		});
	driver.findElement(By.tagName('selectx'))
		.then(function() {
			ok(false, "found");
		})
		.thenCatch(function() {
			ok(true, "not found");
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("findElementsByTagName", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElements(By.tagName('select'))
		.then(function(elements) {
			equal(elements.length, 1, "found");
		});
	driver.findElements(By.tagName('selectx'))
		.then(function(elements) {
			equal(elements.length, 0, "not found");
		})
		.thenCatch(function(e) {
			ok(false, "error:" + e);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("findElementByXpath", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.xpath('//option'))
		.then(function(a) {
			ok(true, "found");
		});
	driver.findElement(By.xpath('//table'))
		.then(function() {
			ok(false, "found");
		})
		.thenCatch(function() {
			ok(true, "not found");
		});
	driver.findElement(By.xpath('foo['))
		.then(function() {
			ok(false, "can't catch error");
		})
		.thenCatch(function(e) {
			ok(true, "catch error:" + e);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("findElementsByXpath", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElements(By.xpath("//form[@name='sample']//option"))
		.then(function(elements) {
			equal(elements.length, 11, "found");
		});
	driver.findElements(By.xpath('//table'))
		.then(function(eleemnts) {
			equal(eleemnts.length, 0, "not found");
		})
		.thenCatch(function(e) {
			ok(false, "error:" + e);
		});
	driver.findElement(By.xpath('foo['))
		.then(function() {
			ok(false, "can't catch error");
		})
		.thenCatch(function(e) {
			ok(true, "catch error:" + e);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("executeScript", function() {
	title();
	driver.get('/tests/input.html');
	//success
	driver.executeScript('x = 12 * 34')
	.then(function(result) {
			equal(408, result, "12 * 34=" + result);
		})
		.thenCatch(function() {
			ok(false, "can't execute");
		});
	driver.executeScript('x = 12 * 34;')
		.then(function(result) {
			equal(408, result, "12 * 34=" + result);
		})
		.thenCatch(function() {
			ok(false, "can't execute");
		});
	driver.executeScript('x')
		.then(function(result) {
			equal(408, result, "12 * 34=" + result);
		})
		.thenCatch(function() {
			ok(false, "can't execute");
		});
	driver.executeScript(function(a,b,c) {
		return a * b * c;
	}, 23, 45, 67)
		.then(function(result) {
			equal(result, 23*45*67, "with native parameters");
		})
		.thenCatch(function() {
			ok(false, "can't execute");
		});
	driver.findElement(By.name("phone"))
		.then(function(e) {
			driver.executeScript(function(e) {
					e.value = "12345";
					return e.value;
				}, e)
				.then(function(result) {
					equal(result, "12345", "with element parameters");
				})
				.thenCatch(function() {
					ok(false, "can't execute");
				});
		})
		.thenCatch(function(error) {
			ok(false, error);
		});
	//failure
	driver.executeScript('hogehoge')
		.then(function(result) {
			ok(false, "no error");
		})
		.thenCatch(function(error) {
			ok(true, "error:" + error);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("executeAsyncScript", function() {
	title();
	driver.get('/tests/input.html');
	driver.executeAsyncScript(
		function() {
			var callback = arguments[arguments.length - 1];
			var time = (new Date()).getTime();
			setTimeout(function() { callback((new Date()).getTime() - time, "now"); }, 3000);
		}
	).then(function(result) {
		ok(2990 <= result && result <= 3010, result);
	});
	driver.sleep(0)
		.then(function() {
			start();
		});
});

asyncTest("getPageSource", function() {
	title();
	driver.get('/tests/input.html');
	driver.getPageSource()
		.then(function(html) {
			ok(html.match(/^<html/), html);
		})
		.thenCatch(function() {
			ok(false);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest('isElementPresent', function() {
	title();
	driver.get('/tests/input.html');
	driver.isElementPresent(By.name('name'))
	.then(function(e) {
		ok(e, "element present");
	});
	driver.isElementPresent(By.name('namex'))
	.then(function(e) {
		ok(!e, "element not present");
	});
	driver.sleep(0)
		.thenFinally(function() {
			start();
		});
});

/**
 * cancel, clear, click, findElement, findElements, getAttribute, getCssValue,
 * getDriver, getInnerHtml, getLocation, getOuterHtml, getSize, getTagName,
 * getText, isDisplayed, isElementPresent, isEnabled, isPending, isSelected,
 * sendKeys, submit, then, thenCatch, thenFinally
 */
module("WebElement");
asyncTest("click", function() {
	title();
	//link
	driver.get('/tests/input.html');
	driver.findElement(By.css('#navi a')).click();
	driver.wait(function() {
		return driver.getTitle().then(function(title) {
			var expected = 'list';
			var result = title == expected;
			if (result) {
				equal(expected, title, expected);
			}
			return result;
		});
	}, 3000)
	.thenCatch(function() {
		ok(false, "not found");
	});

	//submit
	driver.get('/tests/input.html');
	driver.findElement(By.name('ok')).click()
	driver.wait(function() {
		return driver.getTitle().then(function(title) {
			var expected = 'list';
			var result = title === expected;
			if (result) {
				equal(expected, title, expected);
			}
			return result;
		});
	}, 3000)
	.thenCatch(function() {
		ok(false, "not found");
	});

	//radio
	driver.get('/tests/input.html');
	var radio = driver.findElement(By.xpath("//input[@name='sex' and @value='male']")).click()
	driver.wait(function() {
		return driver.getTitle().then(function(title) {
			var expected = 'input';
			var result = title === expected;
			if (result) {
				equal(expected, title, expected);
			}
			return result;
		});
	}, 3000)
	.thenCatch(function() {
		ok(false, "not found");
	});
	
	//select
	driver.findElement(By.xpath("//select/option[@value='30']")).click()
	driver.wait(function() {
		return driver.getTitle().then(function(title) {
			var expected = 'input';
			var result = title === expected;
			if (result) {
				equal(expected, title, expected);
			}
			return result;
		});
	}, 3000)
	.thenCatch(function() {
		ok(false, "not found");
	});
	
	//not link or button
	driver.findElement(By.className("title")).click()
	driver.wait(function() {
		return driver.getTitle().then(function(title) {
			var expected = 'input';
			var result = title === expected;
			if (result) {
				equal(expected, title, expected);
			}
			return result;
		});
	}, 3000)
	.thenCatch(function() {
		ok(false, "not found");
	})
	.thenFinally(function() {
		start();
	});
});

asyncTest("sendKeys", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.name('name'))
		.sendKeys("Mike")
		.then(function(v) {
			equal(v, 'Mike', "sendkeys");
		})
		.thenCatch(function() {
			ok(false, "not found");
		});
	driver.findElement(By.name('name'))
		.then(function(e) {
			driver.executeScript(
				function(e) {
					return e.value;
				}, e)
				.then(function(result) {
					equal(result, 'Mike');
				});
		});
	driver.findElement(By.name('age'))
		.sendKeys("50")
		.then(function() {
			ok(true, "sendkeys");
		})
		.thenCatch(function() {
			ok(false, "not found");
		});
	driver.findElement(By.name('age'))
		.then(function(e) {
			driver.executeScript(
				function(e) {
					return e.value;
				}, e)
				.then(function(result) {
					equal(result, '50');
				});
		});
	driver.findElement(By.name('comment'))
		.sendKeys("はじめまして\nこんにちわ")
		.then(function() {
			ok(true, "sendkeys");
		})
		.thenCatch(function() {
			ok(false, "not found");
		});
	driver.findElement(By.name('comment'))
		.then(function(e) {
			driver.executeScript(
				function(e) {
					return e.value;
				}, e)
				.then(function(result) {
					equal(result, 'はじめまして\nこんにちわ');
				});
		});
	driver.sleep(0)
		.thenFinally(function() {
			start();
		});
});

asyncTest("getText", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.className('title'))
		.getText()
		.then(function(text) {
			equal("Input address", text, "text:" + text);
		})
		.thenCatch(function() {
			ok(false, "not found");
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("getTagName", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.className('title'))
		.getTagName()
		.then(function(tagName) {
			equal("h1", tagName, "tagName:" + tagName);
		})
		.thenCatch(function() {
			ok(false, "not found");
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("getCssValue", function() {
	title();
	driver.get('/tests/list.html');
	driver.findElement(By.id('row-template'))
		.getCssValue('display')
		.then(function(cssValue) {
			equal("none", cssValue, "cssValue:" + cssValue);
		})
		.thenCatch(function() {
			ok(false, "not found");
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("getAttribute", function() {
	title();
	driver.get('/tests/list.html');
	driver.findElement(By.id('row1'))
		.getAttribute('class')
		.then(function(attrValue) {
			equal("address odd", attrValue, "attrValue:" + attrValue);
		})
		.thenCatch(function() {
			ok(false, "not found");
		})
		.thenFinally(function() {
			start();
		});
});

/*
asyncTest("getValue", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.id('age'))
		.getValue()
		.then(function(value) {
			equal("50-60", value, "value:" + value);
		})
		.thenCatch(function() {
			ok(false, "not found");
		})
		.thenFinally(function() {
			start();
		});
});
*/

asyncTest('isDisplayed', function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.id("hidden"))
		.isDisplayed()
		.then(function(value) {
			equal(value, false, "value:" + value);
		})
		.thenCatch(function() {
			ok(false, "not found");
		});

	driver.findElement(By.id("nodisplay"))
		.isDisplayed()
		.then(function(value) {
			equal(value, false, "value:" + value);
		})
		.thenCatch(function() {
			ok(false, "not found");
		});

	driver.findElement(By.id("navi"))
		.isDisplayed()
		.then(function(value) {
			equal(value, true, "value:" + value);
		})
		.thenCatch(function() {
			ok(false, "not found");
		});
	
	driver.sleep(0)
		.thenFinally(function() {
			start();
		})
});

asyncTest('isSelected', function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.xpath("//option[@value='50']"))
		.isSelected()
		.then(function(value) {
			equal(value, true, "50:" + value);
		})
		.thenCatch(function() {
			ok(false, "not found");
		});

	driver.findElement(By.xpath("//option[@value='30']"))
	.isSelected()
	.then(function(value) {
		equal(value, false, "30:" + value);
	})
	.thenCatch(function() {
		ok(false, "not found");
	});

	driver.findElement(By.xpath("//input[@name='sex' and @value='male']"))
		.isSelected()
		.then(function(value) {
			equal(value, false, "male:" + value);
		})
		.thenCatch(function() {
			ok(false, "not found");
		});
	
	driver.findElement(By.xpath("//input[@name='sex' and @value='female']"))
		.isSelected()
		.then(function(value) {
			equal(value, true, "female:" + value);
		})
		.thenCatch(function() {
			ok(false, "not found");
		});

	driver.findElement(By.xpath("//input[@name='single']"))
		.isSelected()
		.then(function(value) {
			equal(value, false, "single:" + value);
		})
		.thenCatch(function() {
			ok(false, "not found");
		});
	
	driver.findElement(By.xpath("//input[@name='mail']"))
		.isSelected()
		.then(function(value) {
			equal(value, true, "mail:" + value);
		})
		.thenCatch(function() {
			ok(false, "not found");
		});
	
	driver.findElement(By.name("name"))
		.isSelected()
		.then(function(value) {
			equal(value, false, "input:" + value);
		})
		.thenCatch(function() {
			ok(false, "not found");
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("elementByName", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.id('form1'))
		.then(function(e) {
			e.findElement(By.name("name"))
				.then(function(e) {
					e.getAttribute("name")
						.then(function(text) {
							equal(text, "name");
						});
				})
				.thenCatch(function(e) {
					ok(false, "not found:" + e);
				});
		})
		.thenCatch(function() {
			ok(false, "not found");
		})
		.thenFinally(function() {
			start();
		});
})

asyncTest("elementsByName", function() {
	title();
	driver.get('/tests/input.html');
	driver.findElement(By.id('form1'))
		.then(function(e) {
			e.findElements(By.name("name"))
				.then(function(e) {
					e[0].getAttribute("name")
						.then(function(text) {
							equal(text, "name");
						});
				})
				.thenCatch(function(e) {
					ok(false, "not found:" + e);
				});
		})
		.thenCatch(function() {
			ok(false, "not found");
		})
		.thenFinally(function() {
			start();
		});
})

asyncTest("getOuterHtml", function() {
	driver.get('/tests/input.html');
	driver.findElement(By.id('navi'))
		.getOuterHtml()
		.then(function(html) {
			ok(html.indexOf("<div ") >= 0, html);
		})
		.thenCatch(function(e) {
			ok(false, e);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("getInnerHtml", function() {
	driver.get('/tests/input.html');
	driver.findElement(By.id('navi'))
		.getInnerHtml()
		.then(function(html) {
			ok(html.indexOf('<a ') >= 0, html);
		})
		.thenCatch(function(e) {
			ok(false, e);
		})
		.thenFinally(function() {
			start();
		});
});

module("WebDriver.navigate()");
asyncTest("navigate()", function() {
	var result = driver.navigate();
	equal(typeof(result['back']), 'function');
	equal(typeof(result['forward']), 'function');
	equal(typeof(result['refresh']), 'function');
	equal(typeof(result['to']), 'function');
	start();
});

asyncTest('back()', function(){
	driver.get("input.html");
	driver.wait(function() {
		return driver.getTitle().then(function(title) {
				return title == 'input';
			});
	}, 5000);
	driver.get("list.html");
	driver.wait(function() {
		return driver.getTitle().then(function(title) {
				return title == 'list';
			});
	}, 5000);
	
	driver.navigate().back()
		.then(function(e) {
			driver.getTitle()
				.then(function(title) {
					equal(title, "input");
				});
		})
		.thenCatch(function(e) {
			ok(false, "ERROR:" + e);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest('forward()', function(){
	driver.get("input.html");
	driver.wait(function() {
		return driver.getTitle().then(function(title) {
				return title == 'input';
			});
	}, 5000);
	driver.get("list.html");
	driver.wait(function() {
		return driver.getTitle().then(function(title) {
				return title == 'list';
			});
	}, 5000);
	driver.executeScript("history.back()");

	driver.navigate().forward()
		.then(function(e) {
			driver.getTitle()
				.then(function(title) {
					equal(title, "list");
				});
		})
		.thenCatch(function(e) {
			ok(false, "ERROR:" + e);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest('refresh()', function(){
	driver.get("input.html");
	driver.wait(function() {
		return driver.getTitle().then(function(title) {
				return title == 'input';
			});
	}, 5000);
	driver.executeScript("document.body.innerHTML='';");
	
	driver.navigate().refresh()
		.thenCatch(function(e) {
			ok(false, "ERROR:" + e);
		});
	driver.findElements(By.css('form'))
		.then(function(elements) {
			ok(elements.length > 0, "refreshed.");
		})
		.thenCatch(function(e) {
			ok(false, "ERROR:" + e);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest('to()', function(){
	driver.navigate()
	.to("list.html")
	.then(function(e) {
		ok(true);
	})
	.thenCatch(function(e) {
		ok(false, "ERROR:" + e);
	});
	driver.wait(function() {
		return driver.getTitle().then(function(title) {
				return title == 'list';
			});
	}, 5000)
	.thenCatch(function() {
		ok(false, "TIMEOUT");
	})
	.thenFinally(function() {
		start();
	});
});

module("WebDriver.manage()");
asyncTest('manage()', function() {
	var manage = driver.manage();
	ok(typeof(manage.addCookie) == 'function', "addCookie");
	
	ok(typeof(manage.logs) == 'function', "logs");
	start();
});

asyncTest('addCookie()', function(){
	var cookie = (new Date).getTime();
	driver.get("input.html");
	driver.manage()
		.addCookie("foo", cookie)
		.thenCatch(function(e) {
			ok(false, "ERROR:" + e);
		})
	driver.executeScript("document.cookie")
		.then(function(result) {
			ok(result.indexOf("foo=" + cookie) >= 0, "cookie[foo]=" + result);
		})
		.thenCatch(function(e) {
			ok(false, "ERROR:" + e);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest('deleteAllCookies()', function(){
	var cookie = (new Date).getTime();
	driver.get("input.html");
	driver.executeScript("document.cookie='foo=bar'")
	driver.executeScript("document.cookie='bar=baz'")
	driver.executeScript("document.cookie='baz=foo'")
	driver.manage()
		.deleteAllCookies()
		.thenCatch(function(e) {
			ok(false, "ERROR:" + e);
		})
	driver.executeScript("document.cookie")
		.then(function(result) {
			equal(result, "", "cookie:" + result);
		})
		.thenCatch(function(e) {
			ok(false, "ERROR:" + e);
		})
		.thenFinally(function() {
			start();
		});
});
asyncTest('deleteCookie()', function(){
	var cookie = (new Date).getTime();
	driver.get("input.html");
	driver.executeScript("document.cookie='foo=bar'")
	driver.executeScript("document.cookie='bar=baz'")
	driver.executeScript("document.cookie='baz=foo'")
	driver.executeScript("document.cookie")
		.then(function(result) {
			ok(result.indexOf("foo=") >= 0, "cookie:" + result);
			ok(result.indexOf("bar=") >= 0, "cookie:" + result);
			ok(result.indexOf("baz=") >= 0, "cookie:" + result);
		});
	driver.manage()
		.deleteCookie("bar")
		.thenCatch(function(e) {
			ok(false, "ERROR:" + e);
		})
	driver.executeScript("document.cookie")
		.then(function(result) {
			ok(result.indexOf("foo=") >= 0, "cookie:" + result);
			ok(result.indexOf("bar=") < 0,  "cookie:" + result);
			ok(result.indexOf("baz=") >= 0, "cookie:" + result);
		})
		.thenCatch(function(e) {
			ok(false, "ERROR:" + e);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest('getCookie()', function(){
	var cookie = (new Date).getTime();
	driver.get("input.html");
	driver.executeScript("document.cookie='foo=bar'")
	driver.executeScript("document.cookie='bar=baz'")
	driver.executeScript("document.cookie")
		.then(function(result) {
			ok(result.indexOf("foo=") >= 0, "cookie:" + result);
			ok(result.indexOf("bar=") >= 0, "cookie:" + result);
		});
	driver.manage()
	.getCookie("foo")
	.then(function(result) {
		equal(result.name, "foo");
		equal(result.value, "bar");
	})
	.thenCatch(function(e) {
		ok(false, "ERROR:" + e);
	})
	driver.manage()
		.getCookie("bar")
		.then(function(result) {
			equal(result.name, "bar");
			equal(result.value, "baz");
		})
		.thenCatch(function(e) {
			ok(false, "ERROR:" + e);
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest('getCookies()', function(){
	var cookie = (new Date).getTime();
	driver.get("input.html");
	driver.executeScript("document.cookie='foo=bar'")
	driver.executeScript("document.cookie='bar=baz'")
	driver.executeScript("document.cookie")
		.then(function(result) {
			ok(result.indexOf("foo=") >= 0, "cookie:" + result);
			ok(result.indexOf("bar=") >= 0, "cookie:" + result);
		});
	driver.manage()
		.getCookies()
		.then(function(result) {
			ok(result.length > 0, "cookie.length=" + result.length);
			for (var i = 0; i < result.length; i++) {
				switch(result[i].name) {
				case 'foo':
					equal(result[i].value, 'bar');
					break;
				case 'bar':
					equal(result[i].value, 'baz');
					break;
				}
			}
		})
		.thenCatch(function(e) {
			ok(false, "ERROR:" + e);
		})
		.thenFinally(function() {
			start();
		});
});

module("Logs");
asyncTest('logs()', function(){
	var logs = driver.manage().logs();
	ok(typeof(logs.get) == 'function', "get");
	ok(typeof(logs.getAvailableLogTypes) == 'function', "getAvailableLogTypes");
	start();
});

asyncTest("get()", function() {
	driver.manage().logs().get()
		.then(function(logs) {
			ok(true);
		})
		.thenCatch(function(e) {
			ok(false, e);
		})
		.thenFinally(function() {
			start();
		})
});

module("Timeouts");
asyncTest('timeouts()', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});
asyncTest('window()', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});

module("WebDriver.manage().timeouts()");
asyncTest('implicitWait', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});
asyncTest('pageLoadTimeout', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});
asyncTest('setScriptTimeout', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});

module("WebDriver.manage().window()");
asyncTest('getPosition()', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});
asyncTest('getSize()', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});
asyncTest('maxmize()', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});
asyncTest('setPosition()', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});
asyncTest('setSize()', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});

module("WebDriver.manage().window()");
asyncTest('get()', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});
asyncTest('getAvailableLogTypes()', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});

module("WebDriver.switchTo()");
asyncTest('activeElement()', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});
asyncTest('alert()', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});
asyncTest('defaultContent()', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});
asyncTest('frame()', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});
asyncTest('window()', function(){
	driver.sleep(0).then(function() { ok(false, "not implemented"); start(); });
});

