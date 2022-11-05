// ==UserScript==
// @name         Better Incident Page
// @namespace    https://github.com/VivianVerdant/
// @version      0.5
// @description  Description
// @author       Vivian
// @match        https://*.service-now.com/*
// @resource     customCSS https://github.com/VivianVerdant/service-now-userscripts/raw/main/better_menu.css
// @resource     better_incident_css https://github.com/VivianVerdant/service-now-userscripts/raw/main/css/better_incident.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

/* Changelog
v0.7 - refactor
v0.6 - overhaul
v0.5 - Made Incident fields that are mandatory but not filled out have a more prominent styling.
v0.4 - Made company notes on Incident edit page into a toggleable static div.
v0.3 - Made more reliable, less buggy, and hopefully more performant.
v0.2 - Added more features,
        - Auto show Close Notes when you press the Resolve button.
		- Auto fill user's First name into the Close Notes.
		- Responsive sizing on the Work Notes field.
v0.1 - Initial release
*/

'use strict';

var location = window.location.href;
var run_once = false;
var better_options_btn;

async function onClickResolveBtn(){
	let resolve_tab = document.querySelectorAll("div#tabs2_section > span:nth-child(3) > span:nth-child(1) > span:nth-child(2)")[0];
	console.log("clicking reslove button: ", resolve_tab);
	resolve_tab.click();
	document.getElementById("tabs2_section").scrollIntoView(true);

	var user_name = document.getElementById("sys_display.incident.u_affected_user").getAttribute("value");
	console.log(user_name);
	var close_field = document.getElementById("incident.close_notes");
	close_field.innerHTML = close_field.innerHTML.concat(user_name.split(" ")[0] + " ");
	console.log(close_field);
}

function kbToClipboard(e){
	const INC = document.getElementById('incident.number').value;
	navigator.clipboard.writeText(INC);
	e.target.classList.add("icon-cog");
	setTimeout(() => {e.target.classList.remove("icon-cog");}, 500);

}

function find_or_observe_for_element(query, func, parent_query, once) {

	let parent_node;

	if (parent_query === undefined) {
		parent_node = document.body;
	} else {
		parent_node = document.querySelector(parent_query);
	}

	if (once === undefined) {
		once = true;
	}

	const node_list = parent_node.querySelectorAll(query);
	//console.log("node list: ", node_list);
	if (node_list.length) {
		for (const node of node_list) {
			//console.log("found node already existing: ", node);
			func(node);
			if (once) {
				//console.log("exiting early");
				return;
			}
		}
	}

	const observer = new MutationObserver((mutations_list, observer) => {
		//console.log("callback from: ", observer.original_query);
		//console.log(mutations_list);
		const mutation_fn = (n_list) => {
			//console.log(n_list);
			/*if (m_list.type !== "childList") {
				return;
			}*/
			for (const added_node of n_list) {
				//console.log("added node: ", added_node);
				if (added_node.nodeType !== Node.ELEMENT_NODE) {
					continue;
				}
				if (added_node.matches(query)) {
					func(added_node);
					if (once) {
						observer.disconnect();
						return;
					}
				}
			}
		}
		for (const list of mutations_list) {
			if (list.type == "childList") {
				//console.log("child list: ", list);
				mutation_fn(list.addedNodes);
			}
		}
	});
	Object.defineProperty(observer, "original_query", {value: query, writable: true});
	observer.observe(parent_node, { subtree: true, childList: true });
	//console.log("observer: ", observer);
}

function main(element) {
	console.log("main");
	if (run_once){
		return
	}
	run_once = true;

	GM_addStyle(GM_getResourceText("better_incident_css"));

	find_or_observe_for_element(".outputmsg", (node) => {
		console.log('.outputmsg has been added:-------------------------------------------');
		console.log(node);
		node.firstElementChild.addEventListener("click", (e) => {
			if (e.target.classList.contains("icon-info")) {
				e.target.nextSibling.classList.toggle("hidden");
			}
		});
		node.lastElementChild.classList.add("hidden");
	}, "#output_messages", false);
	find_or_observe_for_element("#resolve_incident", (node) => {
		console.log('#resolve_incident has been added:-------------------------------------------');
		console.log(node);
		node.addEventListener("click", onClickResolveBtn);
	});
	find_or_observe_for_element("input[id='incident.number']", (node) => {
		console.log('#resolve_incident has been added:-------------------------------------------');
		let btn = document.createElement("button");
		btn.classList.add("inc_copy_button","btn");
		let header = document.querySelector("nav.navbar.navbar-default.section_zero > div.container-fluid");
		header.appendChild(btn);
		header.insertBefore(btn, btn.previousSibling);
		btn.addEventListener("click", kbToClipboard);
		let inner = document.createElement("span");
		inner.innerHTML = node.value;
		btn.appendChild(inner);
	});
	find_or_observe_for_element(".activity-stream-textarea, #activity-stream-work_notes-textarea, .question_textarea_input", (node) => {
		console.log('textarea has been added:-------------------------------------------');
		console.log(node);
		const text_area_fn = (e) => {e.target.style.height = "0px"; e.target.style.height = e.target.scrollHeight + 8 + "px";}
		node.addEventListener("change", text_area_fn);
		node.addEventListener("keydown", text_area_fn);
		node.addEventListener("click", text_area_fn);
		setTimeout(() => {node.click();}, 250);
	}, undefined, false);
}

if (location.includes("b47514e26f122500a2fbff2f5d3ee4d0") || location.includes("incident.do")){
	console.warn("Better Incidents Start");
	main();
	console.warn("Better Incidents End");
}
