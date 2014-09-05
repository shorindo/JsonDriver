/*
 * shell.js - using js shell prompt on html
 * licence : Apache v2
 * author  : shorindo.com
 */
var terminal = (function(shell) {
	var _ID = "terminal";
	var Terminal = function(){};
	var frame;
	var line;
	var prompt;
	var command;
	
	var jsonify = function(o){
	    var seen = [];
	    var jso = JSON.stringify(o, function(k,v) {
	        if (typeof v =='object') {
	            if ( !seen.indexOf(v) ) { return '__cycle__'; }
	            seen.push(v);
	        } return v;
	    }, 4);
	    return jso;
	};
	
	Terminal.prototype = {
	init : function() {
			frame = document.getElementById(_ID);
			if (!frame) {
				frame = document.appendChild(document.createElement("div"));
				frame.id = _ID;
			}
//			frame.style.border = "1px solid gray";
//			frame.style.width = "100%";
//			frame.style.height = "150px";
			
			frame.addEventListener("click", function() {
				command.focus();
			}, false);
			
			this.prompt();
		},
	prompt : function() {
			if (command) {
				command.contentEditable = false;
			}
			line = frame.appendChild(document.createElement("li"));
			prompt = line.appendChild(document.createElement("span"));
			prompt.className = "prompt";
			prompt.innerHTML = shell.prompt();
			command = line.appendChild(document.createElement("span"));
			command.className = "command";
			command.contentEditable = true;
			command.addEventListener("keypress", function(evt) {
				if (evt.keyCode == 13) {
					command.contentEditable = false;
					if ("execute" in shell) {
						terminal.print(shell.execute(command.textContent));
					} else if ("executeAsync" in shell) {
						shell.executeAsync(command.textContent, function(result) {
							terminal.print(result);
						});
					}
					return false;
				}
			}, false);
			command.focus();
		},
	print : function(message) {
			if (command) {
				command.contentEditable = false;
			}
			switch(typeof message) {
			case 'object':
				message = jsonify(message, null, 4);
				break;
			}
			line = frame.appendChild(document.createElement("li"));
			line.appendChild(document.createElement("pre"))
				.innerHTML = message;
			terminal.prompt();
		}
	};
	return new Terminal();
})({
	prompt : function() {
		return "wd> ";
	},
	executeAsync : function(command, fn) {
			try {
				driver.executeScript(command)
					.then(fn)
					.thenCatch(function(e) {
						fn(e.message);
					});
			} catch (err) {
				fn(err.toString());
			}
		}
	}
);

window.addEventListener("load", function() { terminal.init(); }, false);

