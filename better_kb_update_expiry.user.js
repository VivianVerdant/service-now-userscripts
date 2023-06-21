// ==UserScript==
// @name         Better KB update expiry
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.1
// @description  Suite of tools and improvements for Service-Now
// @author       Vivian
// @run-at       document-start
// @match        https://*.service-now.com/kb_feedback_task.do*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @grant        GM_getValue
// ==/UserScript==

/* globals  find_or_observe_for_element GlideRecord g_form g_user */

function main_action() {
    g_form.setValue("assignment_group", "d474fa996f07c100ad775ddd5d3ee452", "VRT-Service Desk");
    g_form.setValue("state", 3);
    g_form.setValue("resolution_code", 1);
    g_form.setValue("close_notes", "Updated");

    setTimeout(() => {g_form.setValue("assigned_to", g_user.sysID, g_user.fullName)}, 250)

    const assigned_to = document.querySelector("[id='sys_display.kb_feedback_task.assigned_to']");
    assigned_to.focus()
    setTimeout(() => {assigned_to.blur()}, 500);

    setTimeout(() => {g_form.save();}, 1000);
}

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

let run_once = false;
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
		btn.onclick = main_action;
		const btn_label = btn.addNode("div", "btn_label");
		btn_label.innerHTML = "Close as updated";
	}, undefined, true);
}

escalation_main();
