// ==UserScript==
// @name         Better Dashboard
// @namespace    https://github.com/VivianVerdant/service-now-userscripts
// @version      0.0.2
// @description  Description
// @author       Vivian
// @match        https://*.service-now.com/*
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/issues
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/refs/heads/main/lib/wait_for_element.js
// @resource     better_dashboard_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_dashboard.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @run-at       document-start
// ==/UserScript==

/* globals wait_for_element*/

/* Changelog
    v0.0.2 - cleaned up code, switched to wait_for_element
    v0.1 - Initial release
*/

var location = window.location.href;
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

async function main(element) {
    'use strict';

    GM_addStyle(GM_getResourceText("better_dashboard_css"));

    wait_for_element(".list_group_toggle_overwrite", (node) => {
        if (node.getAttribute("data-expanded") == "false") {
            node.click();
        }
	}, false);

    wait_for_element("#header-container", (node) => {
        node.classList.add("small-header");
        node.onclick = (event) => {
            //event.preventDefualt();
            console.log("toggle");
            document.querySelector("#header-container").classList.toggle("small-header");
        }
	}, false);

    wait_for_element("#clickHereIFrame", (node) => {
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

	}, false);

    wait_for_element("a", (node) => {
        node.setAttribute("target", "_blank");
    }, false);

    wait_for_element("button.icon-refresh", (node) => {
        const intervalID = setInterval((node) => {node.click()}, 30000, node);
    }, false);

}

if (location.includes("pa_dashboard.do") || location.includes("noc1.do") || location.includes("noc2.do")){
    wait_for_element("body", (node) => {
        main();
    });
}
