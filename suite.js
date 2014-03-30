//calling with url parameter wdsid=...
//QUnit.config.autostart = false;
var driver;
QUnit.config.reorder = false;
QUnit.begin = function() {
	driver = new webdriver
		.Builder()
		.usingSession("1234")
		//.withCapabilities(webdriver.Capabilities.firefox())
		.usingServer('http://localhost:4444/wd/hub')
		.build();
};

asyncTest('get', function(){
	//page exist
	driver.get('/tests/input.html');
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

asyncTest("findElementByCssSelector", function() {
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

asyncTest("findElementById", function() {
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

asyncTest("findElementByName", function() {
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

asyncTest("findElementByLinkText", function() {
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

asyncTest("findElementByPartialLinkText", function() {
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

asyncTest("findElementByTagName", function() {
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

asyncTest("findElementByXpath", function() {
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
		})
		.thenFinally(function() {
			start();
		});
});

asyncTest("click", function() {
	//link
	driver.get('/tests/input.html');
	driver.findElement(By.css('#navi a')).click()
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

asyncTest("sendkeys", function() {
	driver.get('/tests/input.html');
	driver.findElement(By.name('name')).sendKeys("Mike")
	.then(function() {
		ok(true, "sendkeys");
	})
	.thenCatch(function() {
		ok(false, "not found");
	});
	driver.findElement(By.name('age')).sendKeys("50")
	.then(function() {
		ok(true, "sendkeys");
	})
	.thenCatch(function() {
		ok(false, "not found");
	})
	.thenFinally(function() {
		start();
	});
});

asyncTest("text", function() {
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
