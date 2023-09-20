// ==UserScript==
// @name         Better KB update expiry
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.3
// @description  Suite of tools and improvements for Service-Now
// @author       Vivian
// @run-at       document-start
// @match        https://*.service-now.com/kb_feedback_task.do*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @grant        GM_getValue
// ==/UserScript==

/* globals  find_or_observe_for_element GlideRecord g_form g_user */

function main_action() {
    // This is the part you'll want to actually edit

    //                                  sys_id of record                    display name of record
    g_form.setValue("assignment_group", "d474fa996f07c100ad775ddd5d3ee452", "VRT-Service Desk");

    /*
        1 = "New"
        2 = "Work in progress"
        8 = "Pending Internal"
        5 = "Pending Customer"
        9 = "Approval needed"
        3 = "Closed"
    */
    g_form.setValue("state", 3);

    /*
        1 = "Updated article"
        2 = "Created article"
        3 = "Updated search configuration"
        4 = "No action"
        6 = "Duplicate"
    */
    g_form.setValue("resolution_code", 1);

    // Resolution notes
    g_form.setValue("close_notes", "Updated");

    // Need to wait a few ms after setting "assignment group" before you can set "assigned to"
    setTimeout(() => {
        //                             current user, display name
        g_form.setValue("assigned_to", g_user.sysID, g_user.fullName)
    }, 250)



    // focus, then blur the "assigned to" field to workaround it not properly "submitting" the record to the form
    // you can just ignore this part
    const assigned_to = document.querySelector("[id='sys_display.kb_feedback_task.assigned_to']");
    assigned_to.focus()
    setTimeout(() => {assigned_to.blur()}, 750);

    setTimeout(() => {g_form.save();}, 2000);
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

    find_or_observe_for_element("[id='kb_feedback_task.feedback.article_label']", (node) => {
		console.log(node);
		const btn = node.parentNode.addNode("a", "custom_btn", ["icon-info"]); //btn btn-default btn-ref icon icon-info
		btn.setAttribute("style", "float: right;");
        const sys_id = document.querySelector("[id='kb_feedback_task.feedback.article']").value;
        btn.href = "https://virteva.service-now.com/kb_knowledge.do?sys_id=" + sys_id + "&sysparm_view=";
		btn.innerHTML = "Open";
        btn.target = "_blank";
	}, undefined, true);

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
