// ==UserScript==
// @name         Better Dashboard
// @namespace    https://github.com/VivianVerdant/service-now-userscripts
// @version      0.1
// @description  Description
// @author       Vivian
// @match        https://*.service-now.com/*
// @match        https://*.service-now.com/incident_list.do*
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/issues
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @resource     better_dashboard_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_dashboard.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @run-at       document-start
// ==/UserScript==
/* globals find_or_observe_for_element*/


/* Changelog
    v0.1 - Initial release
*/

var location = window.location.href;
var run_once = false;

HTMLElement.prototype.addNode = function (type, id, classes) {
	const new_node = document.createElement(type);
	new_node.id = id;
	if (classes) {
		for (const clss of classes) {
			new_node.classList.add(clss);
		}
	}
	this.appendChild(new_node);
	return new_node;
};

function overrideAJAX(){
    console.log("Foo");
	var open = window.XMLHttpRequest.prototype.open,
		load = window.XMLHttpRequest.prototype.load,
		send = window.XMLHttpRequest.prototype.send;

	function openReplacement(method, url, async, user, password) {
		this._url = url;
		//console.log("Open:", JSON.stringify(this), JSON.stringify(arguments));
		return open.apply(this, arguments);
	}

	function sendReplacement(data) {
        console.log(data);
		if(this.onreadystatechange) {
			this._onreadystatechange = this.onreadystatechange;
		}
		this.onreadystatechange = onReadyStateChangeReplacement;

        if (arguments["0"] && arguments["0"].includes("sysparm_synch=true")) {
            //arguments["0"] = arguments["0"].replace("sysparm_synch=true", "sysparm_synch=false");
            console.warn("Send:", JSON.stringify(this), JSON.stringify(arguments));
        }

		return send.apply(this, arguments);

	}

	function onReadyStateChangeReplacement() {
		if (this.readyState == 4 && this._url.includes("rectangle" )){
			let r = JSON.parse(this.response);

		}
		if(this._onreadystatechange) {
			return this._onreadystatechange.apply(this, arguments);
		}
	}

	window.XMLHttpRequest.prototype.open = openReplacement;
	window.XMLHttpRequest.prototype.send = sendReplacement;

}

async function main(element) {
    'use strict';

	console.log("edit main");
	if (run_once){
		return
	}
	run_once = true;

    GM_addStyle(GM_getResourceText("better_dashboard_css"));

    overrideAJAX();

	find_or_observe_for_element("#resolve_incident", (node) => {
		console.log(node);
	}, undefined, false);

    find_or_observe_for_element(".list_group_toggle_overwrite", (node) => {
		console.log(node);
        if (node.getAttribute("data-expanded") == "false") {
            node.click();
        }
	}, undefined, false);

    console.log("Bar");
}

console.warn("Better Dashboard Start");
if (location.includes("pa_dashboard.do")){
    main();
}
console.warn("Better Dashboard End");
