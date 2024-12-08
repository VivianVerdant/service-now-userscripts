// ==UserScript==
// @name         Better Escalations
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.2
// @description  Suite of tools and improvements for Service-Now
// @author       Vivian
// @run-at       document-idle
// @match        https://*.service-now.com/*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @grant        GM_getValue
// ==/UserScript==

/* globals  find_or_observe_for_element g_form g_user */

let run_once = false;

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

async function escalation_action() {

    g_form.setValue("assigned_to", g_user.userID, g_user.fullName)
    g_form.setValue("state", 7)
    setTimeout(() => {g_form.save();}, 200);

}

async function escalation_main() {
	'use strict';

	if (run_once){
		return;
	}

	run_once = true

    console.log("foo");
	find_or_observe_for_element(".navbar-right", (node) => {
		//console.warn(node);
		const btn = node.addNode("button", "custom_btn", ["btn","btn-default"]); //btn btn-default btn-ref icon icon-info
		btn.setAttribute("style", "float: left;");
		btn.onclick = escalation_action;
		const btn_label = btn.addNode("div", "btn_label");
		btn_label.innerHTML = "Assign to me, close, and save";
	}, undefined, true);
}

//const l = new URL(window.location);
console.warn("better escalations start");
if (g_form.tableName == "u_escalations") {
	escalation_main();
}
console.warn("better escalations end");
