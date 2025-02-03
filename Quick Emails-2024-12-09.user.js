// ==UserScript==
// @name         Quick Emails
// @version      2025-03-02
// @description  Buttons for quick email closing
// @author       Ziggy
// @run-at       document-start
// @match        https://*.service-now.com/u_email.do*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @grant        GM_getValue
// ==/UserScript==

/* globals  find_or_observe_for_element GlideRecord g_form g_user */

const GCS_auto = () => {
	g_form.setValue("closed_by", g_user.userID, g_user.fullName);
    g_form.setValue("u_contact", "7cdd78e86f870200248653a11c3ee4cc");
    g_form.setValue("u_close_code", "Informational");
	g_form.setValue("close_notes", "GCS automated notification email; closing as Informational");
    g_form.setValue("state", 3);
	setTimeout(() => {g_form.save();}, 800);
}

const SPAM = () => {
	g_form.setValue("closed_by", g_user.userID, g_user.fullName);
    g_form.setValue("u_close_code", "SPAM");
    g_form.setValue("state", 3);
	setTimeout(() => {g_form.save();}, 200);
}
const Informational = () => {
	g_form.setValue("closed_by", g_user.userID, g_user.fullName);
    g_form.setValue("u_close_code", "Informational");
    g_form.setValue("close_notes", "Informational");
    g_form.setValue("state", 3);
	setTimeout(() => {g_form.save();}, 200);
}

//helper function - @author VivianVerdant
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

//helper function - @author VivianVerdant
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
async function quickEmails_main(){
    'use strict';
    if (run_once){
        return;
    }
    run_once = true
    add_header_button("GCS Notification", GCS_auto);
    add_header_button("SPAM", SPAM);
    add_header_button("Informational", Informational);
}

quickEmails_main();

