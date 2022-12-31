// ==UserScript==
// @name         Better Escalations
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.1
// @description  Suite of tools and improvements for Service-Now
// @author       Vivian
// @run-at       document-start
// @match        https://*.service-now.com/*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @grant        GM_getValue
// ==/UserScript==

/* globals  find_or_observe_for_element */

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

function escalation_action() {
	console.log("foo");
	const ATM_btn = document.querySelector("[data-original-title='Assign to me']");
	console.log(ATM_btn);
	if(ATM_btn){ATM_btn.click();};

	const state_listbox = document.querySelector("[id='u_escalations.state']");
	state_listbox.value = 7;

	const me = document.defaultView.NOW.user_display_name;
	const assigned_to = document.querySelector("[id='sys_display.u_escalations.assigned_to']").value;

	if (assigned_to == me && state_listbox.value ==7){
		const save_btn = document.querySelector("[id='sysverb_update_and_stay']");
		save_btn.click();
	} else {
		console.log(assigned_to);
		console.log(me);
		console.log(state_listbox.value);
	}
}

async function escalation_main() {
	'use strict';

	if (run_once){
		return;
	}

	run_once = true

	find_or_observe_for_element(".navbar-right", (node) => {
		console.log(node);
		const btn = node.addNode("button", "custom_btn", ["btn","btn-default"]); //btn btn-default btn-ref icon icon-info
		btn.setAttribute("style", "float: left;");
		btn.onclick = escalation_action;
		const btn_label = btn.addNode("div", "btn_label");
		btn_label.innerHTML = "Assign to me, close, and save";
	}, undefined, true);
}

const l = new URL(window.location);
console.log("better escalations start");
if (l.searchParams.get("sysparm_record_target") == "u_escalations") {
	escalation_main();
}
console.log("better escalations end");
