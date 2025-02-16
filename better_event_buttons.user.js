// ==UserScript==
// @name         Better Event Buttons
// @namespace    https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @homepageURL  https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @supportURL   https://github.com/VivianVerdant/service-now-userscripts/tree/main
// @version      0.4
// @description  Suite of tools and improvements for Service-Now
// @author       Vivian
// @run-at       document-start
// @match        https://*.service-now.com/u_event.do*
// @require      https://github.com/VivianVerdant/service-now-userscripts/raw/main/find_or_observe_for_element.js
// @grant        GM_getValue
// ==/UserScript==

/* globals  find_or_observe_for_element GlideRecord g_form g_user */

const url_regex = /^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/gmi

const auto_cleared = () => {
    g_form.setValue("state", 3);
    g_form.setValue("u_close_code", "Auto-Cleared");
    setTimeout(() => {g_form.save();}, 200);
}

const informational = () => {
    g_form.setValue("u_category", "Informational");
    g_form.setValue("u_subcategory", "Escalation");
    g_form.setValue("u_trouble_code", "96b743276fdc8a001ef4eef11c3ee4c9", "Informational");
    setTimeout(() => {g_form.save();}, 200);
}

const switch_offline = () => {
    g_form.setValue("u_category", "Network");
    g_form.setValue("u_subcategory", "Switch");
    g_form.setValue("u_trouble_code", "fd8128276fd31100ad775ddd5d3ee401", "Switch Offline");
    setTimeout(() => {g_form.save();}, 200);
}

const vm_offline = () => {
    g_form.setValue("u_category", "Infrastructure");
    g_form.setValue("u_subcategory", "Vmware");
    g_form.setValue("u_trouble_code", "c51164276fd31100ad775ddd5d3ee4b1", "Host Offline");
    setTimeout(() => {g_form.save();}, 200);
}

const server_perf = () => {
    g_form.setValue("u_category", "Infrastructure");
    g_form.setValue("u_subcategory", "Server");
    g_form.setValue("u_trouble_code", "a90011346f32f9006f41cf30be3ee46d", "Performance");
    setTimeout(() => {g_form.save();}, 200);
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
		//console.log(node);
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

    add_header_button("VM Offline", vm_offline);
    add_header_button("Switch Offline", switch_offline);
    add_header_button("Informational", informational);
    add_header_button("Server Perf", server_perf);
    add_header_button("Auto-Cleared", auto_cleared);
/*
    window.addEventListener('load', function () {
        const node = document.querySelector("[name='u_event.description']");
        console.log(node.innerHTML);
    })
*/

    find_or_observe_for_element("[name='u_event.description']", (node) => {
		const text = node.value;
        console.log(node.value);
        const results = text.match(url_regex);
        const addons_node = document.querySelector("[id='element.u_event.description']"); //.querySelector(".form-field-addons");
        if (results) {
            for (const url of results) {
                console.log(url);
                console.log(addons_node);
                let link_button = addons_node.addNode("a", "local_time_button", ["btn", "btn-default", "compact", "icon-info"]);
                link_button.innerHTML = "Link"
                link_button.style.width = "64px";
                link_button.href = url;
                link_button.target = "_blank"
            }
        } else {
            console.log("no urls");
        }
	}, undefined, true);

}

escalation_main();
