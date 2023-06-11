// ==UserScript==
// @name         Better KB update valid to
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.1
// @description  Suite of tools and improvements for Service-Now
// @author       Vivian
// @run-at       document-start
// @match        https://*.service-now.com/kb_knowledge.do*
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
    const date = new Date()

    const date_string = String(date.getFullYear()) + "-" + String(date.getMonth()+7) + "-01";

	const state_dropdown = document.querySelector("[id='kb_knowledge.valid_to']");
    state_dropdown.value = date_string;

	if (date_string == state_dropdown.value){
		setTimeout(() => {
            const save_btn = document.querySelector("[id='sysverb_update_and_stay']");
            save_btn.click()
        }, 250);
	} else {
		setTimeout(escalation_action(), 250);
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
		btn_label.innerHTML = "Valid for 6 more months";
	}, undefined, true);
}

escalation_main();
