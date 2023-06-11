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
    const state_dropdown = document.querySelector("[id='kb_feedback_task.state']");
    const resolution_code = document.querySelector("[id='kb_feedback_task.resolution_code']");

    while ( state_dropdown.value != 3 || resolution_code.value != 1) {
        state_dropdown.value = 3;

        resolution_code.value = 1;

        const close_note = "Updated";
        const close_notes = document.querySelector("[id='kb_feedback_task.close_notes']");
        close_notes.value = close_note;
    }
		const save_btn = document.querySelector("[id='sysverb_update_and_stay']");
		setTimeout(save_btn.click(),500);
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
		btn_label.innerHTML = "Close as updated";
	}, undefined, true);
}

escalation_main();
