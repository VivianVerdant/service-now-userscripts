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

var INC;
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

function kbToClipboard(){
	navigator.clipboard.writeText(INC);
	this.classList.add("icon-cog");
	setTimeout(() => {this.classList.remove("icon-cog");}, 500);

}

function find_or_await_element(query, func) {
	const node = document.querySelectorAll(query)[0];
	if (node){func(node);return}
	const observer = new MutationObserver(function(mutations_list) {
		mutations_list.forEach(function(mutation) {
			if (mutation.type != "childList") {
				return;
			}
			for (const added_node of mutation.addedNodes) {
				if (added_node.nodeType != 1) {
					continue;
				}
				if (added_node.matches(query)) {
					func(added_node);
				}
			}
		});
	});
	observer.observe(document.documentElement, { subtree: true, childList: true });
}

function main(element) {
	console.log("main");
	if (run_once){
		return
	}
	run_once = true;

	GM_addStyle(GM_getResourceText("better_incident_css"));

	find_or_await_element(".outputmsg", function(node) {
		console.log('.outputmsg has been added:-------------------------------------------');
		console.log(node.nodeValue);
		node.firstElementChild.addEventListener("click", function (e) {
			if (this.classList.contains("icon-info")) {
				this.nextSibling.classList.toggle("hidden");
			}
		});
		node.lastElementChild.classList.add("hidden");
	});
	find_or_await_element("#resolve_incident", function(node) {
		console.log('#resolve_incident has been added:-------------------------------------------');
		console.log(node.nodeValue);
		node.addEventListener("click", onClickResolveBtn);
	});
	find_or_await_element("input[id='incident.number']", function(node) {
		console.log('#resolve_incident has been added:-------------------------------------------');
		console.log(node.nodeValue);
		let btn = document.createElement("button");
		btn.classList.add("inc_copy_button","btn");
		let header = document.querySelectorAll("nav.navbar.navbar-default.section_zero > div.container-fluid")[0];
		header.appendChild(btn);
		header.insertBefore(btn, btn.previousSibling);
		btn.addEventListener("click", kbToClipboard);
		let inner = document.createElement("span");
		inner.innerHTML = node.value;
		btn.appendChild(inner);
	});
	find_or_await_element(".question_textarea_input", function(node) {
		console.log('.question_textarea_input has been added:-------------------------------------------');
		console.log(node.nodeValue);
		node.setAttribute("onchange", 'this.style.height = "";this.style.height = this.scrollHeight + 16 + "px";');
		node.setAttribute("onkeydown", 'this.style.height = "";this.style.height = this.scrollHeight + 16 + "px";');
		node.setAttribute("style", "overflow-y: max-content; max-height: 2000px !important; resize: none;");
	});
	find_or_await_element("#activity-stream-work_notes-textarea", function(node) {
		console.log('#activity-stream-work_notes-textarea has been added:-------------------------------------------');
		console.log(node.nodeValue);
		node.setAttribute("onchange", 'this.style.height = "";this.style.height = this.scrollHeight + 16 + "px";');
		node.setAttribute("onkeydown", 'this.style.height = "";this.style.height = this.scrollHeight + 16 + "px";');
		node.setAttribute("style", "overflow-y: max-content; max-height: 2000px !important; resize: none;");
		node.style.height = node.scrollHeight + 16 + "px";
	});
	find_or_await_element(".activity-stream-textarea", function(node) {
		console.log('.activity-stream-textarea has been added:-------------------------------------------');
		console.log(node.nodeValue);
		node.setAttribute("onchange", 'this.style.height = "";this.style.height = this.scrollHeight + 16 + "px";');
		node.setAttribute("onkeydown", 'this.style.height = "";this.style.height = this.scrollHeight + 16 + "px";');
		node.setAttribute("style", "overflow-y: max-content; max-height: 2000px !important; resize: none;");
		node.style.height = node.scrollHeight + 16 + "px";
	});
}

if (location.includes("b47514e26f122500a2fbff2f5d3ee4d0") || location.includes("incident.do")){
	console.warn("Better Incidents Start");
	main();
	console.warn("Better Incidents End");
}
