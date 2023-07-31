// ==UserScript==
// @name         Better Dashboard
// @namespace    https://github.com/VivianVerdant/service-now-userscripts
// @version      0.1
// @description  Description
// @author       Vivian
// @match        https://*.service-now.com/*
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
var noc = 1;

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
	var open = window.XMLHttpRequest.prototype.open,
		load = window.XMLHttpRequest.prototype.load,
		send = window.XMLHttpRequest.prototype.send;

	function openReplacement(method, url, async, user, password) {
		this._url = url;
		//console.log("Open:", JSON.stringify(this), JSON.stringify(arguments));
		return open.apply(this, arguments);
	}

	function sendReplacement(data) {
		if(this.onreadystatechange) {
			this._onreadystatechange = this.onreadystatechange;
		}
		this.onreadystatechange = onReadyStateChangeReplacement;

        if (arguments["0"] && arguments["0"].includes("sysparm_synch=true")) {
            //arguments["0"] = arguments["0"].replace("sysparm_synch=true", "sysparm_synch=false");
            //console.warn("Send:", JSON.stringify(this), JSON.stringify(arguments));
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
	}, undefined, false);

    find_or_observe_for_element(".list_group_toggle_overwrite", (node) => {
        if (node.getAttribute("data-expanded") == "false") {
            node.click();
        }
	}, undefined, false);

    find_or_observe_for_element("#header-container", (node) => {
        node.classList.add("small-header");
        node.onclick = (event) => {
            //event.preventDefualt();
            console.log("toggle");
            document.querySelector("#header-container").classList.toggle("small-header");
        }
	}, undefined, false);


    find_or_observe_for_element("#clickHereIFrame", (node) => {
        console.log(node);
        node = node.parentNode.parentNode.parentNode;
        const frame = document.createElement("iframe");
        frame.id = "noc-frame";
        frame.classList.add("noc-frame");
        const shadow = node.parentNode.attachShadow({ mode: "open" });
        const style_node = document.createElement("style");
        style_node.innerHTML = GM_getResourceText("better_dashboard_css");
        shadow.appendChild(style_node);
        shadow.appendChild(frame);

        node.classList.add("hidden");
        if (noc === 1) {
            frame.setAttribute("src", "https://virteva.service-now.com/noc1.do");
            noc += 1;
        } else {
            frame.setAttribute("src", "https://virteva.service-now.com/noc2.do");

        }
	}, undefined, false);


/*    setTimeout(() => {
        const header = document.querySelector("#noc-frame").contentDocument.head.addNode("style", "", []);
        header.setAttribute("type", "text/css");
        header.innerHTML = `#newevent_header,
                                #newevent_footer {
                                    font-size: 50px !important;
                                }`;
    }, 6000);*/
}

console.warn("Better Dashboard Start");
if (location.includes("pa_dashboard.do") || location.includes("noc1.do") || location.includes("noc2.do")){
    console.warn(location);
    main();
}
console.warn("Better Dashboard End");
