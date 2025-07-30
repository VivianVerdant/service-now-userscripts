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

        node.classList.add("addednocwait");
        wait_for_element("#clickHereIFrame:not(.addednocwait)", (node) => {
            const noc1 = document.querySelectorAll("#clickHereIFrame")[0].parentNode.parentNode.parentNode;

            const frame1 = document.createElement("iframe");
            frame1.id = "noc-frame";
            frame1.classList.add("noc-frame");
            const shadow1 = noc1.parentNode.attachShadow({ mode: "open" });
            const style_node1 = document.createElement("style");
            style_node1.innerHTML = GM_getResourceText("better_dashboard_css");
            shadow1.appendChild(style_node1);
            shadow1.appendChild(frame1);
            noc1.classList.add("hidden");
            frame1.setAttribute("src", "https://virteva.service-now.com/noc1.do");

            const noc2 = document.querySelectorAll("#clickHereIFrame")[1].parentNode.parentNode.parentNode;
            const frame2 = document.createElement("iframe");
            frame2.id = "noc-frame";
            frame2.classList.add("noc-frame");
            const shadow2 = noc2.parentNode.attachShadow({ mode: "open" });
            const style_node2 = document.createElement("style");
            style_node2.innerHTML = GM_getResourceText("better_dashboard_css");
            shadow2.appendChild(style_node2);
            shadow2.appendChild(frame2);
            noc2.classList.add("hidden");
            frame2.setAttribute("src", "https://virteva.service-now.com/noc2.do");

        });
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
