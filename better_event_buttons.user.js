// ==UserScript==
// @name         Better Event Buttons
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.1
// @description  Suite of tools and improvements for Service-Now
// @author       Vivian
// @run-at       document-start
// @match        https://*.service-now.com/u_event.do*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @grant        GM_getValue
// ==/UserScript==

/* globals  find_or_observe_for_element GlideRecord g_form g_user */

const auto_cleared = () => {
    // This is the part you'll want to actually edit

    //                                  sys_id of record                    display name of record
   // g_form.setValue("assignment_group", "d474fa996f07c100ad775ddd5d3ee452", "VRT-Service Desk");

    /*
        1 = "New"
        2 = "Active"
        3 = "Cleared"
    */
    g_form.setValue("state", 3);

    /*
        "-- None --"
        "Auto-Cleared"
        "Resolved by Parent"
        "Caused by Change"
    */
    g_form.setValue("u_close_code", "Auto-Cleared");

    // Resolution notes
    //g_form.setValue("close_notes", "Updated");

    // Need to wait a few ms after setting "assignment group" before you can set "assigned to"
    /*
    setTimeout(() => {
        //                             current user, display name
        g_form.setValue("assigned_to", g_user.sysID, g_user.fullName)
    }, 250)*/



    // focus, then blur the "assigned to" field to workaround it not properly "submitting" the record to the form
    // you can just ignore this part
    /*
    const assigned_to = document.querySelector("[id='sys_display.kb_feedback_task.assigned_to']");
    assigned_to.focus()
    setTimeout(() => {assigned_to.blur()}, 500);*/

    setTimeout(() => {g_form.save();}, 1000);
}

const switch_offline = () => {
    // This is the part you'll want to actually edit

    //                                  sys_id of record                    display name of record
    g_form.setValue("u_trouble_code", "fd8128276fd31100ad775ddd5d3ee401", "Switch Offline");


    g_form.setValue("u_category", 3);
    g_form.setValue("u_subcategory", 3);

    // Resolution notes
    //g_form.setValue("close_notes", "Updated");

    // Need to wait a few ms after setting "assignment group" before you can set "assigned to"
    /*
    setTimeout(() => {
        //                             current user, display name
        g_form.setValue("assigned_to", g_user.sysID, g_user.fullName)
    }, 250)*/



    // focus, then blur the "assigned to" field to workaround it not properly "submitting" the record to the form
    // you can just ignore this part
    /*
    const assigned_to = document.querySelector("[id='sys_display.kb_feedback_task.assigned_to']");
    assigned_to.focus()
    setTimeout(() => {assigned_to.blur()}, 500);*/

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

async function add_header_button(name, func) {
    	find_or_observe_for_element(".navbar-right", (node) => {
		console.log(node);
		const btn = node.addNode("button", "custom_btn", ["btn","btn-default"]); //btn btn-default btn-ref icon icon-info
		btn.setAttribute("style", "float: left;");
		btn.onclick = func;
		const btn_label = btn.addNode("div", "btn_label");
		btn_label.innerHTML = name;
	}, undefined, true);
}


let run_once = false;
async function escalation_main() {
	'use strict';
	if (run_once){
		return;
	}
	run_once = true

    add_header_button("Switch Offline", switch_offline);
    add_header_button("Auto-Cleared", auto_cleared);

}

escalation_main();